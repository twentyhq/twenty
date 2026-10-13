import {
  ConflictException,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { type Request } from 'express';
import { type Readable } from 'stream';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import {
  type WorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RECORD_EXPORT_DOWNLOAD_TOKEN_TTL_SECONDS,
  RECORD_EXPORT_MAX_DURATION_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { type RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { type RecordExportDownloadTokenJwtPayload } from 'src/engine/core-modules/record-export/types/record-export-download-token-jwt-payload.type';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { buildRecordExportColumns } from 'src/engine/core-modules/record-export/utils/build-record-export-columns.util';
import { TRACKED_JOB_PROGRESS_SCHEMA } from 'src/engine/core-modules/tracked-job/constants/tracked-job-progress-schema.constant';
import { TrackedJobWorkspaceService } from 'src/engine/core-modules/tracked-job/services/tracked-job.workspace-service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { resolveEffectiveTranslatedFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-translated-flat-entity.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type RecordExportQueryContext = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  columns: RecordExportColumn[];
  selectedFields: CommonSelectedFields;
};

@Injectable()
export class RecordExportWorkspaceService {
  private readonly logger = new Logger(RecordExportWorkspaceService.name);

  constructor(
    private readonly trackedJobWorkspaceService: TrackedJobWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
    private readonly userSessionCookieService: UserSessionCookieService,
    @Inject(CacheStorageNamespace.EngineRecordExport)
    private readonly cacheStorageService: CacheStorageService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    @InjectMessageQueue(MessageQueue.recordExportQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  async stream({
    parameters,
    authContext,
    requestTokenHash,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
    requestTokenHash: string;
  }): Promise<AsyncIterableIterator<RecordExportDTO>> {
    const requester = await this.trackedJobWorkspaceService.assertRequester(
      authContext,
      PermissionFlagType.EXPORT_CSV,
    );
    const { queryRunnerContext } = await this.buildContext({
      parameters,
      authContext: requester,
    });

    return this.trackedJobWorkspaceService.start({
      authContext: requester,
      permissionFlag: PermissionFlagType.EXPORT_CSV,
      queue: this.messageQueueService,
      jobName: 'GenerateRecordExportJob',
      data: {
        parameters,
        requestTokenHash,
        filename: `${queryRunnerContext.flatObjectMetadata.nameSingular}.csv`,
      },
      maxDurationMs: RECORD_EXPORT_MAX_DURATION_MS,
      progressSchema: TRACKED_JOB_PROGRESS_SCHEMA,
      messages: {
        alreadyRunning: t`An export is already running in this workspace. Please wait for it to finish.`,
        interrupted: t`The export was interrupted. Please try again.`,
      },
      toUpdate: async ({ status, percentage, errorMessage }, recordExport) => ({
        id: recordExport.id,
        filename: recordExport.filename,
        progress: percentage,
        errorMessage,
        downloadPath:
          status === 'completed'
            ? await this.getDownloadPath(recordExport)
            : undefined,
      }),
      onCancel: (recordExport) => this.removeFile(recordExport),
    });
  }

  async removeFile({
    workspaceId,
    id,
  }: Pick<RecordExport, 'workspaceId' | 'id'>): Promise<void> {
    // Keep pending rows until their writer stops, so failed cleanup remains retryable.
    const file = await this.fileRepository.findOne(workspaceId, {
      where: {
        id,
        path: `${FileFolder.RecordExport}/${id}.csv`,
        status: FILE_STATUS.UPLOADED,
      },
    });
    if (isDefined(file)) {
      await this.fileStorageService.deleteFile({
        ...this.getFileResource({ workspaceId, id }),
        applicationId: file.applicationId,
      });
    }
  }

  async findOrThrow({
    workspaceId,
    id,
  }: Pick<RecordExport, 'workspaceId' | 'id'>): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: {
        id,
        path: `${FileFolder.RecordExport}/${id}.csv`,
        status: FILE_STATUS.UPLOADED,
      },
    });
    if (!isDefined(file)) {
      throw new NotFoundException(t`Export not found.`);
    }
    return file;
  }

  async getDownloadPath(
    recordExport: Omit<RecordExport, 'parameters' | 'jobName' | 'expiresAt'>,
  ): Promise<string> {
    await this.trackedJobWorkspaceService.resolveRequester({
      ...recordExport,
      permissionFlag: PermissionFlagType.EXPORT_CSV,
    });
    await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
      recordExport,
    );
    await this.findOrThrow(recordExport);
    const payload: RecordExportDownloadTokenJwtPayload = {
      type: JwtTokenTypeEnum.FILE,
      purpose: 'record-export',
      sub: recordExport.workspaceId,
      workspaceId: recordExport.workspaceId,
      fileId: recordExport.id,
      userWorkspaceId: recordExport.userWorkspaceId,
      workspaceMemberId: recordExport.workspaceMemberId,
      requestTokenHash: recordExport.requestTokenHash,
      permissionsHash: recordExport.permissionsHash,
      filename: recordExport.filename,
    };
    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: RECORD_EXPORT_DOWNLOAD_TOKEN_TTL_SECONDS,
    });
    await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
      recordExport,
    );
    return `/file/record-export/${recordExport.id}?token=${token}`;
  }

  async openDownload({
    id,
    token,
    request,
  }: {
    id: string;
    token: string;
    request: Request;
  }): Promise<{
    stream: Readable;
    filename: string;
    cleanup: () => Promise<void>;
  }> {
    const payload = await this.verifyDownloadToken(id, token);
    const recordExport = { ...payload, id };
    this.assertDownloader({ request, recordExport });
    await this.findOrThrow(recordExport);
    const cleanup = () =>
      this.removeFile(recordExport).catch(() => {
        this.logger.warn(`Failed to remove export ${id}`);
      });
    try {
      await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
        recordExport,
      );
      await this.trackedJobWorkspaceService.resolveRequester({
        ...recordExport,
        permissionFlag: PermissionFlagType.EXPORT_CSV,
      });
    } catch (error) {
      await cleanup();
      throw error;
    }
    const claimed = await this.cacheStorageService.setIfAbsent(
      `{${payload.workspaceId}}:download:${id}:claimed`,
      true,
      RECORD_EXPORT_DOWNLOAD_TOKEN_TTL_SECONDS * 1000,
    );
    if (!claimed) {
      throw new ConflictException(
        t`This export download has already started or expired.`,
      );
    }
    let stream: Readable | undefined;
    try {
      stream = await this.fileStorageService.readFile(
        this.getFileResource(recordExport),
      );
      await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
        recordExport,
      );
      return { stream, filename: payload.filename, cleanup };
    } catch (error) {
      stream?.destroy();
      await cleanup();
      throw error;
    }
  }

  private async verifyDownloadToken(
    id: string,
    token: string,
  ): Promise<RecordExportDownloadTokenJwtPayload> {
    try {
      const payload: RecordExportDownloadTokenJwtPayload =
        await this.jwtWrapperService.verifyJwtToken(token);
      if (
        payload.type !== JwtTokenTypeEnum.FILE ||
        payload.purpose !== 'record-export' ||
        payload.fileId !== id ||
        !isDefined(payload.workspaceId)
      ) {
        throw new ForbiddenException(
          t`Invalid or expired export download link.`,
        );
      }
      return payload;
    } catch {
      throw new ForbiddenException(t`Invalid or expired export download link.`);
    }
  }

  getFileResource({
    workspaceId,
    id,
  }: Pick<RecordExport, 'workspaceId' | 'id'>) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.RecordExport,
      resourcePath: `${id}.csv`,
    };
  }

  async buildContext({
    parameters,
    authContext,
  }: {
    parameters: RecordExportParameters;
    authContext: UserWorkspaceAuthContext;
  }): Promise<RecordExportQueryContext> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      );
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: parameters.objectMetadataId,
    });
    const rawFields = parameters.fieldMetadataIds.map((fieldMetadataId) => {
      const field = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldMetadataId,
      });

      if (field.objectMetadataId !== flatObjectMetadata.id) {
        throw new BadRequestException(
          t`An export field is no longer available.`,
        );
      }

      return field;
    });
    const getI18nContext =
      await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
        {
          applicationIds: rawFields.map((field) => field.applicationId),
          locale: authContext.workspaceMember.locale,
          workspaceId: authContext.workspace.id,
        },
      );
    const fields = rawFields.map((field) =>
      resolveEffectiveTranslatedFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: field,
        i18nContext: getI18nContext(field.applicationId),
      }),
    );
    if (fields.some((field) => !field.isActive)) {
      throw new BadRequestException(t`An export field is no longer available.`);
    }
    const columns = buildRecordExportColumns(fields);
    const node: CommonSelectedFields = {};

    for (const column of columns) {
      if (isDefined(column.subFieldName)) {
        const nested = node[column.fieldName];
        node[column.fieldName] = {
          ...(typeof nested === 'object' ? nested : {}),
          [column.subFieldName]: true,
        };
      } else {
        node[column.fieldName] = true;
      }
    }

    return {
      columns,
      selectedFields: { edges: { node } },
      queryRunnerContext: {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular: buildObjectIdByNameMaps(flatObjectMetadataMaps)
          .idByNameSingular,
      },
    };
  }

  getRequestTokenHashOrThrow(request: Request): string {
    const token =
      this.jwtWrapperService.extractJwtFromRequest()(request) ??
      this.userSessionCookieService.extractSessionTokenFromRequest(request);

    if (!isDefined(token)) {
      throw new ForbiddenException(t`Sign in to export records.`);
    }

    return hashUserSessionToken(token);
  }

  assertDownloader({
    request,
    recordExport,
  }: {
    request: Request;
    recordExport: Pick<
      RecordExport,
      | 'workspaceId'
      | 'userWorkspaceId'
      | 'workspaceMemberId'
      | 'requestTokenHash'
    >;
  }): void {
    if (
      request.workspace?.id !== recordExport.workspaceId ||
      request.userWorkspaceId !== recordExport.userWorkspaceId ||
      request.workspaceMemberId !== recordExport.workspaceMemberId ||
      this.getRequestTokenHashOrThrow(request) !== recordExport.requestTokenHash
    ) {
      throw new ForbiddenException(
        t`This export belongs to another session. Please create a new export.`,
      );
    }
  }
}
