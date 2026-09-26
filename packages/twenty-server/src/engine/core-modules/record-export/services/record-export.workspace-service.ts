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
import { setTimeout } from 'node:timers/promises';
import { type Readable } from 'stream';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import {
  type WorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
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
  RECORD_EXPORT_CONNECTION_TTL_MS,
  RECORD_EXPORT_DOWNLOAD_TOKEN_TTL_SECONDS,
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_PROGRESS_INTERVAL_MS,
  RECORD_EXPORT_PAGE_SIZE,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { UPDATE_OWNED_KEY_LEASE_SCRIPT } from 'src/engine/core-modules/cache-storage/constants/update-owned-key-lease-script.constant';
import { type RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { type RecordExportDownloadTokenJwtPayload } from 'src/engine/core-modules/record-export/types/record-export-download-token-jwt-payload.type';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { buildRecordExportColumns } from 'src/engine/core-modules/record-export/utils/build-record-export-columns.util';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { resolveEffectiveTranslatedFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-translated-flat-entity.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';

export type RecordExportQueryContext = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  columns: RecordExportColumn[];
  selectedFields: CommonSelectedFields;
};

const RECORD_EXPORT_PERMISSION_CACHE_KEYS: WorkspaceCacheKeyName[] = [
  'rolesPermissions',
  'userWorkspaceRoleMap',
  'flatRoleMaps',
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
  'flatWorkspaceMemberMaps',
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
];

const recordExportProgressSchema = z.object({
  processedRecordCount: z.number().int().nonnegative(),
  totalRecordCount: z.number().int().nonnegative().nullable(),
  errorMessage: z.string().optional(),
});

@Injectable()
export class RecordExportWorkspaceService {
  private readonly logger = new Logger(RecordExportWorkspaceService.name);

  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
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

  async stream(input: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
    requestTokenHash: string;
  }): Promise<AsyncIterableIterator<RecordExportDTO>> {
    const service = this;
    const recordExport = await this.create(input);
    let downloadReady = false;
    let jobId: string;

    async function* events(
      signal: AbortSignal,
    ): AsyncGenerator<RecordExportDTO> {
      while (!signal.aborted) {
        const updated = await service.getProgress(recordExport, jobId);
        if (signal.aborted) {
          return;
        }
        downloadReady = isDefined(updated.downloadPath);
        yield updated;
        if (downloadReady || isDefined(updated.errorMessage)) {
          return;
        }
        await setTimeout(RECORD_EXPORT_PROGRESS_INTERVAL_MS, undefined, {
          signal,
        });
      }
    }

    const stream = wrapAsyncIteratorWithLifecycle(events, {
      heartbeatStart: 'immediate',
      heartbeatErrorBehavior: 'close',
      heartbeatIntervalMs: RECORD_EXPORT_PROGRESS_INTERVAL_MS,
      onHeartbeat: async () => {
        if (downloadReady) {
          return false;
        }
        if (
          Date.now() - recordExport.createdAt > RECORD_EXPORT_MAX_DURATION_MS ||
          !(await this.updateLease(
            recordExport,
            RECORD_EXPORT_CONNECTION_TTL_MS,
          ))
        ) {
          throw new BadRequestException(
            t`The export was interrupted. Please try again.`,
          );
        }
        return true;
      },
      onCleanup: async () => {
        if (downloadReady) {
          await this.updateLease(recordExport, 0);
        } else {
          await this.cancel(recordExport);
        }
      },
    });
    try {
      jobId = await this.enqueue(recordExport);
    } catch (error) {
      await stream.return?.();
      throw error;
    }
    return stream;
  }

  async create({
    parameters,
    authContext,
    requestTokenHash,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
    requestTokenHash: string;
  }): Promise<RecordExport> {
    const requester = await this.assertCanExport(authContext);
    const permissionsHash = await this.capturePermissionsHash(
      requester.workspace.id,
    );
    const context = await this.buildContext({
      parameters,
      authContext: requester,
    });
    const recordExport: RecordExport = {
      id: v4(),
      createdAt: Date.now(),
      workspaceId: requester.workspace.id,
      userWorkspaceId: requester.userWorkspaceId,
      workspaceMemberId: requester.workspaceMemberId,
      requestTokenHash,
      permissionsHash,
      parameters,
      filename: `${context.queryRunnerContext.flatObjectMetadata.nameSingular}.csv`,
    };
    const acquired = await this.cacheStorageService.setIfAbsent(
      `{${recordExport.workspaceId}}:active`,
      recordExport.id,
      RECORD_EXPORT_CONNECTION_TTL_MS,
    );
    if (!acquired) {
      throw new ConflictException(
        t`An export is already running in this workspace. Please wait for it to finish.`,
      );
    }
    return recordExport;
  }

  async enqueue(recordExport: RecordExport): Promise<string> {
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
  }

  async getProgress(
    recordExport: RecordExport,
    jobId: string,
  ): Promise<RecordExportDTO> {
    const jobs = await this.messageQueueService.getJobs<RecordExport>([jobId]);
    const job = jobs[jobId];
    const progress = recordExportProgressSchema.safeParse(job?.progress).data;
    const update: RecordExportDTO = {
      id: recordExport.id,
      filename: recordExport.filename,
      progress: progress?.totalRecordCount
        ? Math.min(
            99,
            Math.floor(
              (100 * progress.processedRecordCount) / progress.totalRecordCount,
            ),
          )
        : 0,
      errorMessage: null,
    };
    if (
      !isDefined(job) ||
      job.state === 'failed' ||
      Date.now() - recordExport.createdAt > RECORD_EXPORT_MAX_DURATION_MS
    ) {
      return {
        ...update,
        errorMessage:
          progress?.errorMessage ??
          t`The export was interrupted. Please try again.`,
      };
    }
    if (job.state === 'completed') {
      return {
        ...update,
        progress: 100,
        downloadPath: await this.getDownloadPath(recordExport),
      };
    }
    return update;
  }

  async cancel({
    workspaceId,
    id,
  }: Pick<RecordExport, 'workspaceId' | 'id'>): Promise<void> {
    await this.updateLease({ workspaceId, id }, 0);
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
    recordExport: Omit<RecordExport, 'parameters' | 'createdAt'>,
  ): Promise<string> {
    await this.resolveRequester(recordExport);
    await this.assertPermissionsUnchanged(recordExport);
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
    await this.assertPermissionsUnchanged(recordExport);
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
      this.cancel(recordExport).catch(() => {
        this.logger.warn(`Failed to remove export ${id}`);
      });
    try {
      await this.assertPermissionsUnchanged(recordExport);
      await this.resolveRequester(recordExport);
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
      await this.assertPermissionsUnchanged(recordExport);
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

  async assertConnected(
    recordExport: Pick<RecordExport, 'workspaceId' | 'id'>,
    signal: AbortSignal,
  ): Promise<void> {
    signal.throwIfAborted();
    if (
      (await this.cacheStorageService.get<string>(
        `{${recordExport.workspaceId}}:active`,
      )) !== recordExport.id
    ) {
      throw new RecordExportException(
        'Export connection closed',
        'CONNECTION_CLOSED',
      );
    }
  }

  private async updateLease(
    { workspaceId, id }: Pick<RecordExport, 'workspaceId' | 'id'>,
    ttl: number,
  ): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: UPDATE_OWNED_KEY_LEASE_SCRIPT,
        keys: [`{${workspaceId}}:active`],
        args: [JSON.stringify(id), String(ttl)],
      })) === 1
    );
  }
  async assertCanExport(
    authContext: WorkspaceAuthContext,
  ): Promise<UserWorkspaceAuthContext> {
    if (
      !isUserAuthContext(authContext) ||
      isDefined(authContext.application) ||
      isDefined(authContext.viaApplication)
    ) {
      throw new ForbiddenException(t`Sign in to export records.`);
    }

    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId: authContext.workspace.id,
        userWorkspaceId: authContext.userWorkspaceId,
        applicationId: undefined,
        setting: PermissionFlagType.EXPORT_CSV,
      }))
    ) {
      throw new ForbiddenException(
        t`You do not have permission to export records.`,
      );
    }

    return authContext;
  }

  async resolveRequester(
    recordExport: Pick<
      RecordExport,
      'workspaceId' | 'userWorkspaceId' | 'workspaceMemberId'
    >,
  ): Promise<UserWorkspaceAuthContext> {
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceId: recordExport.workspaceId,
      workspaceMemberId: recordExport.workspaceMemberId,
    });

    if (!isDefined(workspaceMember)) {
      throw new ForbiddenException(
        t`The export requester is no longer a workspace member.`,
      );
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId: recordExport.workspaceId,
        relations: ['user', 'workspace'],
      });

    if (
      !isDefined(userWorkspace) ||
      userWorkspace.id !== recordExport.userWorkspaceId
    ) {
      throw new ForbiddenException(
        t`The export requester is no longer a workspace member.`,
      );
    }

    return this.assertCanExport(
      buildUserAuthContext({
        workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
        user: fromUserEntityToFlat(userWorkspace.user),
        userWorkspaceId: userWorkspace.id,
        workspaceMember,
        workspaceMemberId: workspaceMember.id,
      }),
    );
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

  async countRecords({
    parameters,
    context,
  }: {
    parameters: Pick<RecordExportParameters, 'filter'>;
    context: RecordExportQueryContext;
  }): Promise<number> {
    const { results } = await withWorkspaceAuthContext(
      context.queryRunnerContext.authContext,
      () =>
        this.commonFindManyQueryRunnerService.execute(
          {
            filter: parameters.filter,
            selectedFields: { ...context.selectedFields, totalCount: true },
            first: 0,
          },
          context.queryRunnerContext,
        ),
    );
    if (!isDefined(results.totalCount)) {
      throw new RecordExportException(
        'Export record count is unavailable',
        'RECORD_COUNT_UNAVAILABLE',
      );
    }
    return Number(results.totalCount);
  }

  async readPage({
    parameters,
    context,
    after,
    first = RECORD_EXPORT_PAGE_SIZE,
  }: {
    parameters: Pick<RecordExportParameters, 'filter' | 'orderBy'>;
    context: RecordExportQueryContext;
    after?: string;
    first?: number;
  }) {
    return withWorkspaceAuthContext(
      context.queryRunnerContext.authContext,
      () =>
        this.commonFindManyQueryRunnerService.execute(
          {
            filter: parameters.filter,
            orderBy: parameters.orderBy,
            selectedFields: context.selectedFields,
            first,
            after,
          },
          context.queryRunnerContext,
        ),
    );
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

  async capturePermissionsHash(workspaceId: string): Promise<string> {
    const { hashes } =
      await this.workspaceCacheService.getOrRecomputeWithHashes(
        workspaceId,
        RECORD_EXPORT_PERMISSION_CACHE_KEYS,
      );

    return combineCacheHashes(hashes, RECORD_EXPORT_PERMISSION_CACHE_KEYS);
  }

  async assertPermissionsUnchanged(
    recordExport: Pick<RecordExport, 'workspaceId' | 'permissionsHash'>,
  ): Promise<void> {
    if (
      recordExport.permissionsHash !==
      (await this.workspaceCacheService.getOrRecomputeCombinedHash(
        recordExport.workspaceId,
        RECORD_EXPORT_PERMISSION_CACHE_KEYS,
      ))
    ) {
      throw new ForbiddenException(
        t`Access permissions have changed. Please create a new export.`,
      );
    }
  }
}
