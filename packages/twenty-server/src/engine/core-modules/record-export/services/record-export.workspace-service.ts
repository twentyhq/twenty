import { v4 } from 'uuid';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { RecordExportSecurityService } from 'src/engine/core-modules/record-export/services/record-export-security.service';
import { type RecordExportDownloadTokenJwtPayload } from 'src/engine/core-modules/record-export/types/record-export-download-token-jwt-payload.type';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
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
  RECORD_EXPORT_DOWNLOAD_TTL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { type RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import {
  type RecordExport,
  type RecordExportDownload,
  type RecordExportProgress,
  type RecordExportResult,
} from 'src/engine/core-modules/record-export/types/record-export.type';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class RecordExportWorkspaceService {
  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    private readonly recordExportSecurityService: RecordExportSecurityService,
    @InjectMessageQueue(MessageQueue.recordExportQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async create({
    parameters,
    authContext,
    requestTokenHash,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
    requestTokenHash: string;
  }): Promise<RecordExport> {
    const requester =
      await this.recordExportQueryWorkspaceService.assertCanExport(authContext);
    const permissionsHash =
      await this.recordExportSecurityService.capturePermissionsHash(
        requester.workspace.id,
      );
    const context = await this.recordExportQueryWorkspaceService.buildContext({
      parameters,
      authContext: requester,
    });
    const workspaceId = requester.workspace.id;

    const recordExport: RecordExport = {
      id: v4(),
      createdAt: Date.now(),
      workspaceId,
      userWorkspaceId: requester.userWorkspaceId,
      workspaceMemberId: requester.workspaceMemberId,
      requestTokenHash,
      permissionsHash,
      parameters,
      filename: `${context.queryRunnerContext.flatObjectMetadata.nameSingular}.csv`,
    };
    await this.recordExportCacheService.acquireLease(recordExport);
    return recordExport;
  }

  async enqueue(recordExport: RecordExport): Promise<string> {
    try {
      const jobId = await this.messageQueueService.add(
        'GenerateRecordExportJob',
        recordExport,
        { id: recordExport.id },
      );
      if (!isDefined(jobId)) {
        throw new RecordExportException(
          'The export could not be queued',
          'QUEUE_UNAVAILABLE',
        );
      }
      return jobId;
    } catch (error) {
      await this.cancel(recordExport);
      throw error;
    }
  }

  async getProgress(
    recordExport: RecordExport,
    jobId: string,
  ): Promise<RecordExportDTO & { result?: RecordExportResult }> {
    const jobs = await this.messageQueueService.getJobs<RecordExport>([jobId]);
    const job = jobs[jobId];
    const progress = job?.progress as RecordExportProgress | undefined;
    const result = job?.result as RecordExportResult | undefined;
    const interrupted =
      !isDefined(job) ||
      (job.state === 'completed' && !isDefined(result?.fileId)) ||
      Date.now() - recordExport.createdAt > RECORD_EXPORT_MAX_DURATION_MS;
    const status =
      interrupted || job.state === 'failed'
        ? RecordExportStatus.FAILED
        : job.state === 'completed'
          ? RecordExportStatus.COMPLETED
          : job.state === 'active'
            ? RecordExportStatus.PROCESSING
            : RecordExportStatus.QUEUED;
    return {
      id: recordExport.id,
      filename: recordExport.filename,
      status,
      processedRecordCount:
        result?.processedRecordCount ?? progress?.processedRecordCount ?? 0,
      totalRecordCount:
        result?.totalRecordCount ?? progress?.totalRecordCount ?? null,
      errorMessage:
        status === RecordExportStatus.FAILED
          ? (progress?.errorMessage ??
            t`The export was interrupted. Please try again.`)
          : null,
      result,
    };
  }

  async prepareDownload(
    recordExport: RecordExport,
    result: RecordExportResult,
  ): Promise<void> {
    const created = await this.recordExportCacheService.createDownload({
      ...recordExport,
      ...result,
      expiresAt: Date.now() + RECORD_EXPORT_DOWNLOAD_TTL_MS,
    });
    if (!created) {
      throw new NotFoundException(t`Export not found.`);
    }
  }

  async cancel({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<void> {
    await this.recordExportCacheService.delete({ workspaceId, id });
    await this.fileStorageService.deleteFolder({
      ...this.getFileResource({ workspaceId, resourcePath: id }),
      folderPath: id,
      // Pending rows must survive cancellation until their writer has stopped.
      fileStatus: FILE_STATUS.UPLOADED,
    });
  }

  async findOrThrow({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<RecordExportDownload> {
    const recordExport = await this.recordExportCacheService.findDownload({
      workspaceId,
      id,
    });

    if (!isDefined(recordExport)) {
      throw new NotFoundException(t`Export not found.`);
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
    await this.recordExportSecurityService.assertPermissionsUnchanged(
      recordExport,
    );
    const context = await this.recordExportQueryWorkspaceService.buildContext({
      parameters: recordExport.parameters,
      authContext: requester,
    });
    await this.recordExportQueryWorkspaceService.readPage({
      parameters: recordExport.parameters,
      context,
      first: 0,
    });
    const payload: RecordExportDownloadTokenJwtPayload = {
      type: JwtTokenTypeEnum.FILE,
      purpose: 'record-export',
      sub: requester.workspace.id,
      workspaceId: requester.workspace.id,
      userWorkspaceId: requester.userWorkspaceId,
      fileId: recordExport.id,
    };
    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: 60,
    });
    await this.recordExportSecurityService.assertPermissionsUnchanged(
      recordExport,
    );

    return `${this.twentyConfigService.get('SERVER_URL')}/record-exports/${recordExport.id}/download?token=${token}`;
  }

  assertDownloadable(recordExport: RecordExportDownload): void {
    if (recordExport.expiresAt <= Date.now()) {
      throw new BadRequestException(
        t`This export has expired. Please create a new export.`,
      );
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
