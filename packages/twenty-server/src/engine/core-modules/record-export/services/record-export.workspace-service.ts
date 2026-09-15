import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, MoreThan, QueryFailedError } from 'typeorm';
import { v4 } from 'uuid';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_RETENTION_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class RecordExportWorkspaceService {
  private readonly logger = new Logger(RecordExportWorkspaceService.name);

  constructor(
    @InjectWorkspaceScopedRepository(RecordExportEntity)
    private readonly recordExportRepository: WorkspaceScopedRepository<RecordExportEntity>,
    @InjectMessageQueue(MessageQueue.recordExportQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async create(
    parameters: RecordExportParameters,
    authContext: WorkspaceAuthContext,
  ): Promise<RecordExportEntity> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const context = await this.recordExportQueryWorkspaceService.buildContext(
      parameters,
      requester,
    );
    const workspaceId = requester.workspace.id;

    let recordExport: RecordExportEntity;

    try {
      recordExport = await this.recordExportRepository.insertAndReturnOne(
        workspaceId,
        {
          id: v4(),
          userWorkspaceId: requester.userWorkspaceId,
          workspaceMemberId: requester.workspaceMemberId,
          parameters,
          filename: `${context.queryRunnerContext.flatObjectMetadata.nameSingular}.csv`,
          expiresAt: new Date(Date.now() + RECORD_EXPORT_RETENTION_MS),
        },
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException(
          t`An export is already running in this workspace. Please wait for it to finish.`,
        );
      }
      throw error;
    }

    try {
      const jobId = await this.messageQueueService.add(
        'GenerateRecordExportJob',
        { workspaceId, recordExportId: recordExport.id },
        { id: recordExport.id },
      );

      if (!isDefined(jobId)) {
        throw new Error('The export could not be queued');
      }

      await this.recordExportRepository.update(
        workspaceId,
        { id: recordExport.id },
        { jobId },
      );
    } catch (error) {
      await this.recordExportRepository.update(
        workspaceId,
        { id: recordExport.id, status: RecordExportStatus.QUEUED },
        {
          status: RecordExportStatus.FAILED,
          errorMessage: t`The export could not be queued. Please try again.`,
        },
      );
      throw error;
    }

    return this.findOrThrow(workspaceId, recordExport.id);
  }

  async retry(
    id: string,
    authContext: WorkspaceAuthContext,
  ): Promise<RecordExportEntity> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const recordExport = await this.findOrThrow(requester.workspace.id, id);
    if (recordExport.userWorkspaceId !== requester.userWorkspaceId)
      throw new NotFoundException(t`Export not found.`);
    if (recordExport.status !== RecordExportStatus.FAILED)
      throw new BadRequestException(t`Only failed exports can be retried.`);
    return this.create(recordExport.parameters, requester);
  }

  async findOrThrow(
    workspaceId: string,
    id: string,
  ): Promise<RecordExportEntity> {
    const recordExport = await this.recordExportRepository.findOne(
      workspaceId,
      { where: { id } },
    );

    if (!isDefined(recordExport)) {
      throw new NotFoundException(t`Export not found.`);
    }

    return recordExport;
  }

  async findMine(
    authContext: WorkspaceAuthContext,
  ): Promise<RecordExportEntity[]> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const exports = await this.recordExportRepository.find(
      requester.workspace.id,
      {
        where: {
          userWorkspaceId: requester.userWorkspaceId,
          expiresAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
        take: 10,
      },
    );

    return Promise.all(
      exports.map((recordExport) => this.reconcile(recordExport)),
    );
  }

  async reconcile(
    recordExport: RecordExportEntity,
  ): Promise<RecordExportEntity> {
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
      (!isDefined(job) && age > 60_000) ||
      age > RECORD_EXPORT_MAX_DURATION_MS
    ) {
      await this.recordExportRepository.update(
        recordExport.workspaceId,
        {
          id: recordExport.id,
          status: In([
            RecordExportStatus.QUEUED,
            RecordExportStatus.PROCESSING,
          ]),
          attemptId: recordExport.attemptId ?? IsNull(),
        },
        {
          status: RecordExportStatus.FAILED,
          errorMessage: t`The export was interrupted. Please try again.`,
        },
      );
      const updated = await this.findOrThrow(
        recordExport.workspaceId,
        recordExport.id,
      );
      await this.publish(updated);
      return updated;
    }

    return recordExport;
  }

  async getDownloadUrl(
    id: string,
    authContext: WorkspaceAuthContext,
  ): Promise<string> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const recordExport = await this.findOrThrow(requester.workspace.id, id);

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

  assertDownloadable(recordExport: RecordExportEntity): void {
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

  async publish(recordExport: RecordExportEntity): Promise<void> {
    try {
      await this.workspaceEventBroadcaster.broadcastRecordExportEvent({
        workspaceId: recordExport.workspaceId,
        userWorkspaceId: recordExport.userWorkspaceId,
        recordExport,
      });
    } catch {
      this.logger.warn(
        `Failed to publish export status for ${recordExport.id}`,
      );
    }
  }

  getFileResource(workspaceId: string, resourcePath: string) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.RecordExport,
      resourcePath,
    };
  }

  async deleteFiles(recordExport: RecordExportEntity): Promise<void> {
    await this.fileStorageService.deleteFolder({
      ...this.getFileResource(recordExport.workspaceId, recordExport.id),
      folderPath: recordExport.id,
    });
  }
}
