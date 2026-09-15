import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { setTimeout } from 'node:timers/promises';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { t } from '@lingui/core/macro';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_CONNECTION_TTL_MS,
  RECORD_EXPORT_PROGRESS_INTERVAL_MS,
  RECORD_EXPORT_MISSING_JOB_TIMEOUT_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class RecordExportWorkspaceService {
  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    @InjectMessageQueue(MessageQueue.recordExportQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly cleanupQueueService: MessageQueueService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async create({
    parameters,
    authContext,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
  }): Promise<RecordExport> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const context = await this.recordExportQueryWorkspaceService.buildContext(
      parameters,
      requester,
    );
    const workspaceId = requester.workspace.id;

    const recordExport = await this.recordExportCacheService.create({
      workspaceId,
      userWorkspaceId: requester.userWorkspaceId,
      workspaceMemberId: requester.workspaceMemberId,
      parameters,
      filename: `${context.queryRunnerContext.flatObjectMetadata.nameSingular}.csv`,
    });

    try {
      const cleanupJobId = await this.cleanupQueueService.add(
        'DeleteRecordExportJob',
        { workspaceId, recordExportId: recordExport.id },
        {
          id: recordExport.id,
          delay: RECORD_EXPORT_CONNECTION_TTL_MS,
          retryLimit: 10,
          backoff: {
            strategy: 'exponential',
            initialDelayMilliseconds: 60_000,
          },
        },
      );
      if (!isDefined(cleanupJobId))
        throw new RecordExportException(
          'Export cleanup could not be queued',
          'QUEUE_UNAVAILABLE',
        );

      const jobId = await this.messageQueueService.add(
        'GenerateRecordExportJob',
        { workspaceId, recordExportId: recordExport.id },
        { id: recordExport.id },
      );

      if (!isDefined(jobId)) {
        throw new RecordExportException(
          'The export could not be queued',
          'QUEUE_UNAVAILABLE',
        );
      }

      await this.recordExportCacheService.update({
        workspaceId,
        id: recordExport.id,
        condition: {},
        changes: { jobId },
      });
    } catch (error) {
      await this.recordExportCacheService.update({
        workspaceId,
        id: recordExport.id,
        condition: { statuses: [RecordExportStatus.QUEUED] },
        changes: {
          status: RecordExportStatus.FAILED,
          errorMessage: t`The export could not be queued. Please try again.`,
        },
      });
      throw error;
    }

    return this.findOrThrow({ workspaceId, id: recordExport.id });
  }

  async stream({
    parameters,
    authContext,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
  }): Promise<AsyncIterableIterator<RecordExportDTO>> {
    const recordExport = await this.create({ parameters, authContext });
    const workspaceId = recordExport.workspaceId;
    const abortController = new AbortController();
    const service = this;
    let downloadReady = false;
    let cleanup: Promise<void> | undefined;
    const close = () => {
      abortController.abort();
      if (!downloadReady)
        cleanup ??= service.cancel({ workspaceId, id: recordExport.id });
      return cleanup ?? Promise.resolve();
    };

    async function* events(): AsyncGenerator<RecordExportDTO> {
      try {
        while (!abortController.signal.aborted) {
          const current = await service.recordExportCacheService.findOne({
            workspaceId,
            id: recordExport.id,
            keepAlive: true,
          });
          if (!isDefined(current))
            throw new BadRequestException(
              t`The export was interrupted. Please try again.`,
            );
          const updated = await service.reconcile(current);
          if (abortController.signal.aborted) return;
          if (updated.status === RecordExportStatus.COMPLETED) {
            const downloadUrl = await service.getDownloadUrl({
              id: updated.id,
              authContext,
            });
            if (abortController.signal.aborted) return;
            downloadReady = true;
            yield { ...updated, downloadUrl };
            return;
          }
          yield updated;
          if (updated.status === RecordExportStatus.FAILED) return;
          await setTimeout(RECORD_EXPORT_PROGRESS_INTERVAL_MS, undefined, {
            signal: abortController.signal,
          });
        }
      } catch (error) {
        if (!abortController.signal.aborted) throw error;
      } finally {
        await close();
      }
    }
    const iterator = events();
    return {
      next: () => iterator.next(),
      return: async () => {
        try {
          await close();
        } finally {
          await iterator.return(undefined);
        }
        return { done: true, value: undefined };
      },
      throw: async (error: unknown) => {
        try {
          await close();
        } finally {
          await iterator.return(undefined);
        }
        throw error;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  async cancel({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<void> {
    await this.recordExportCacheService.delete({ workspaceId, id });
    await this.fileStorageService.deleteFolderObjects({
      ...this.getFileResource({ workspaceId, resourcePath: id }),
      folderPath: id,
    });
  }

  async findOrThrow({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<RecordExport> {
    const recordExport = await this.recordExportCacheService.findOne({
      workspaceId,
      id,
    });

    if (!isDefined(recordExport)) {
      throw new NotFoundException(t`Export not found.`);
    }

    return recordExport;
  }

  async reconcile(recordExport: RecordExport): Promise<RecordExport> {
    if (
      ![RecordExportStatus.QUEUED, RecordExportStatus.PROCESSING].includes(
        recordExport.status,
      )
    ) {
      return recordExport;
    }

    const jobs = isDefined(recordExport.jobId)
      ? await this.messageQueueService.getJobs([recordExport.jobId])
      : {};
    const job = isDefined(recordExport.jobId)
      ? jobs[recordExport.jobId]
      : undefined;
    const age = Date.now() - recordExport.createdAt.getTime();

    if (
      job?.state === 'failed' ||
      job?.state === 'completed' ||
      (!isDefined(job) && age > RECORD_EXPORT_MISSING_JOB_TIMEOUT_MS) ||
      age > RECORD_EXPORT_MAX_DURATION_MS
    ) {
      await this.recordExportCacheService.update({
        workspaceId: recordExport.workspaceId,
        id: recordExport.id,
        condition: {
          statuses: [RecordExportStatus.QUEUED, RecordExportStatus.PROCESSING],
          attemptId: recordExport.attemptId,
        },
        changes: {
          status: RecordExportStatus.FAILED,
          errorMessage: t`The export was interrupted. Please try again.`,
        },
      });
      const updated = await this.findOrThrow({
        workspaceId: recordExport.workspaceId,
        id: recordExport.id,
      });
      return updated;
    }

    return recordExport;
  }

  async getDownloadUrl({
    id,
    authContext,
  }: {
    id: string;
    authContext: WorkspaceAuthContext;
  }): Promise<string> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const recordExport = await this.findOrThrow({
      workspaceId: requester.workspace.id,
      id,
    });

    if (recordExport.userWorkspaceId !== requester.userWorkspaceId) {
      throw new NotFoundException(t`Export not found.`);
    }

    this.assertDownloadable(recordExport);
    const context = await this.recordExportQueryWorkspaceService.buildContext(
      recordExport.parameters,
      requester,
    );
    await this.recordExportQueryWorkspaceService.readPage(
      recordExport.parameters,
      context,
      undefined,
      0,
    );
    const token = await this.jwtWrapperService.signAsyncOrThrow(
      {
        type: JwtTokenTypeEnum.FILE,
        sub: requester.workspace.id,
        workspaceId: requester.workspace.id,
        fileId: recordExport.id,
      },
      { expiresIn: 60 },
    );

    return `${this.twentyConfigService.get('SERVER_URL')}/record-exports/${recordExport.id}/download?token=${token}`;
  }

  assertDownloadable(recordExport: RecordExport): void {
    if (recordExport.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        t`This export has expired. Please create a new export.`,
      );
    }
    if (
      recordExport.status !== RecordExportStatus.COMPLETED ||
      !isDefined(recordExport.filePath)
    ) {
      throw new BadRequestException(t`This export is not ready to download.`);
    }
  }

  getFileResource({
    workspaceId,
    resourcePath,
  }: {
    workspaceId: string;
    resourcePath: string;
  }) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.RecordExport,
      resourcePath,
    };
  }
}
