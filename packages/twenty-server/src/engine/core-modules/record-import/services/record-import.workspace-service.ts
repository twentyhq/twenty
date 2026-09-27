import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { setTimeout } from 'node:timers/promises';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import {
  isDefined,
  normalizeSpreadsheetImportRows,
  type SpreadsheetImportRowErrors,
  type SpreadsheetImportValidationMessage,
} from 'twenty-shared/utils';
import { Like } from 'typeorm';
import { v4 } from 'uuid';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RECORD_IMPORT_LEASE_TTL_MS,
  RECORD_IMPORT_MAX_WORKBOOK_BYTES,
  RECORD_IMPORT_PREVIEW_ROW_COUNT,
  RECORD_IMPORT_PROGRESS_INTERVAL_MS,
  RECORD_IMPORT_ROWS_PER_CHUNK,
} from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { type RecordImportColumnSamplesDTO } from 'src/engine/core-modules/record-import/dtos/record-import-column-samples.dto';
import {
  type RecordImportRowDTO,
  type RecordImportRowsPageDTO,
} from 'src/engine/core-modules/record-import/dtos/record-import-rows.dto';
import { type RecordImportPreviewDTO } from 'src/engine/core-modules/record-import/dtos/record-import-preview.dto';
import { type RecordImportDTO } from 'src/engine/core-modules/record-import/dtos/record-import.dto';
import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import {
  type RecordImportJobProgress,
  type RecordImportSession,
  type RecordImportStatus,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';
import {
  buildRecordImportMetadata,
  type RecordImportMetadata,
} from 'src/engine/core-modules/record-import/utils/build-record-import-metadata.util';
import { getRecordImportValidationMessageDescriptor } from 'src/engine/core-modules/record-import/utils/get-record-import-validation-message-descriptor.util';
import { detectRecordImportFileType } from 'src/engine/core-modules/record-import/utils/detect-record-import-file-type.util';
import {
  buildRecordImportMappedFields,
  isRecordImportMappingOutdated,
  parseRecordImportColumns,
} from 'src/engine/core-modules/record-import/utils/parse-record-import-columns.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FILE_TYPE_SNIFF_BYTE_COUNT = 4096;

const RUNNING_STATUSES: RecordImportStatus[] = [
  'PREPARING',
  'VALIDATING',
  'IMPORTING',
  'CANCELLING',
];

// Statuses in which the prepared rows can be mapped and reviewed
const PREPARED_STATUSES: RecordImportStatus[] = [
  'READY',
  'VALIDATING',
  'VALIDATED',
];

export type RecordImportContext = {
  requester: UserWorkspaceAuthContext;
  metadata: RecordImportMetadata;
  queryRunnerContext: CommonBaseQueryRunnerContext;
};

type SessionOwner = Pick<
  RecordImportSession,
  'workspaceId' | 'userWorkspaceId' | 'workspaceMemberId'
>;

@Injectable()
export class RecordImportWorkspaceService {
  constructor(
    private readonly recordImportSessionService: RecordImportSessionService,
    private readonly recordImportStorageService: RecordImportStorageService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileUrlService: FileUrlService,
    private readonly permissionsService: PermissionsService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly i18nService: I18nService,
    @InjectMessageQueue(MessageQueue.recordImportQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async create({
    authContext,
    fileId,
    fileName,
    objectMetadataId,
    timeZone,
  }: {
    authContext: WorkspaceAuthContext;
    fileId: string;
    fileName: string;
    objectMetadataId: string;
    timeZone: string;
  }): Promise<RecordImportPreviewDTO> {
    this.assertValidTimeZone(timeZone);

    const requester = await this.assertCanImport(authContext, objectMetadataId);
    const workspaceId = requester.workspace.id;

    // Completion must never run on a file outside the import folder: the
    // generic completion of other folders has its own permission checks.
    const pendingFile = await this.fileRepository.findOne(workspaceId, {
      where: { id: fileId, path: Like(`${FileFolder.RecordImport}/%`) },
    });

    if (!isDefined(pendingFile)) {
      throw new NotFoundException(t`The uploaded file was not found.`);
    }

    const sourceApplication = await this.applicationRepository.findOneOrFail(
      workspaceId,
      { where: { id: pendingFile.applicationId } },
    );

    const completedFile = await this.fileUploadService.completeFileUpload({
      workspaceId,
      fileId,
      dedicatedFileFolder: FileFolder.RecordImport,
    });

    const now = Date.now();
    const session: RecordImportSession = {
      id: fileId,
      version: 1,
      status: 'UPLOADED',
      workspaceId,
      userWorkspaceId: requester.userWorkspaceId,
      workspaceMemberId: requester.workspaceMemberId,
      locale: requester.workspaceMember.locale,
      objectMetadataId,
      timeZone,
      fileName,
      fileType: 'csv',
      sourceApplicationUniversalIdentifier:
        sourceApplication.universalIdentifier,
      sourceResourcePath: removeFileFolderFromFileEntityPath(
        completedFile.path,
      ),
      sheetNames: [],
      createdAt: now,
      updatedAt: now,
    };

    const fileType = detectRecordImportFileType(
      await this.recordImportStorageService.readSourcePrefix(
        session,
        FILE_TYPE_SNIFF_BYTE_COUNT,
      ),
    );

    if (!isDefined(fileType)) {
      await this.recordImportStorageService.deleteAll(session);

      throw new BadRequestException(
        t`This file format is not supported. Import a CSV or Excel file.`,
      );
    }

    if (
      fileType !== 'csv' &&
      completedFile.size > RECORD_IMPORT_MAX_WORKBOOK_BYTES
    ) {
      await this.recordImportStorageService.deleteAll(session);

      throw new BadRequestException(
        t`Excel files are limited to 100 MB. Save the sheet as CSV to import a larger file.`,
      );
    }

    session.fileType = fileType;

    const { rows, sheetNames } = await this.readPreview(session);

    session.sheetNames = sheetNames;

    if (!(await this.recordImportSessionService.create(session))) {
      throw new ConflictException(t`This file is already being imported.`);
    }

    return { recordImport: this.toDTO(session), rows };
  }

  async preview({
    authContext,
    id,
    sheetName,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
    sheetName?: string;
  }): Promise<RecordImportPreviewDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    this.assertValidSheetName(session, sheetName);

    const { rows } = await this.readPreview(session, sheetName);

    return { recordImport: this.toDTO(session), rows };
  }

  async prepare({
    authContext,
    id,
    version,
    sheetName,
    headerRowIndex,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
    version: number;
    sheetName?: string;
    headerRowIndex: number;
  }): Promise<RecordImportDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    await this.assertCanImport(authContext, session.objectMetadataId);
    this.assertValidSheetName(session, sheetName);

    if (headerRowIndex >= RECORD_IMPORT_PREVIEW_ROW_COUNT) {
      throw new BadRequestException(t`Pick a header row from the preview.`);
    }

    const preparing = await this.compareAndUpdateOrThrow(
      session,
      version,
      ['UPLOADED', ...PREPARED_STATUSES],
      (current) => ({
        ...current,
        status: 'PREPARING',
        sheetName: sheetName ?? current.sheetNames[0],
        headerRowIndex,
        headerValues: undefined,
        rowCount: undefined,
        chunkCount: undefined,
        columns: undefined,
        mappedFields: undefined,
        validationRunId: undefined,
        errorRowCount: undefined,
        errorMessage: undefined,
      }),
    );

    const jobId = await this.messageQueueService.add(
      'PrepareRecordImportJob',
      { workspaceId: preparing.workspaceId, id: preparing.id },
      { id: preparing.id },
    );

    const updated = await this.recordImportSessionService.update(
      preparing,
      (current) => ({ ...current, jobId }),
    );

    return this.toDTO(updated ?? preparing);
  }

  async getColumnSamples({
    authContext,
    id,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
  }): Promise<RecordImportColumnSamplesDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    if (!PREPARED_STATUSES.includes(session.status)) {
      throw new BadRequestException(t`The file is not ready yet.`);
    }

    return this.recordImportStorageService.readColumnSamples(session);
  }

  async setMapping({
    authContext,
    id,
    version,
    columns,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
    version: number;
    columns: unknown[];
  }): Promise<RecordImportDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);
    const { metadata } = await this.buildContext(session);

    const parsedColumns = parseRecordImportColumns({
      columns,
      headerValues: session.headerValues ?? [],
      fields: metadata.spreadsheetImportFields,
    });

    if (!isDefined(parsedColumns)) {
      throw new BadRequestException(
        t`The column mapping is invalid. Match the columns again.`,
      );
    }

    const validating = await this.compareAndUpdateOrThrow(
      session,
      version,
      PREPARED_STATUSES,
      (current) => ({
        ...current,
        status: 'VALIDATING',
        columns: parsedColumns,
        mappedFields: buildRecordImportMappedFields(
          parsedColumns,
          metadata.spreadsheetImportFields,
        ),
        validationRunId: v4(),
        errorRowCount: undefined,
        errorMessage: undefined,
      }),
    );

    const jobId = await this.messageQueueService.add(
      'ValidateRecordImportJob',
      {
        workspaceId: validating.workspaceId,
        id: validating.id,
        validationRunId: validating.validationRunId,
      },
      { id: validating.id },
    );

    const updated = await this.recordImportSessionService.update(
      validating,
      (current) =>
        current.validationRunId === validating.validationRunId
          ? { ...current, jobId }
          : undefined,
    );

    return this.toDTO(updated ?? validating);
  }

  async getRows({
    authContext,
    id,
    offset,
    limit,
    onlyErrors,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
    offset: number;
    limit: number;
    onlyErrors: boolean;
  }): Promise<RecordImportRowsPageDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    if (session.status !== 'VALIDATED') {
      throw new BadRequestException(t`The rows are still being checked.`);
    }

    const { metadata } = await this.buildContext(session);
    const rowCount = session.rowCount ?? 0;
    const pageSize = limit;
    const { errorRowPositions } = onlyErrors
      ? await this.recordImportStorageService.readErrorIndex(session)
      : { errorRowPositions: [] };
    const positions = onlyErrors
      ? errorRowPositions.slice(offset, offset + pageSize)
      : Array.from(
          { length: Math.max(0, Math.min(pageSize, rowCount - offset)) },
          (_, index) => offset + index,
        );
    const i18n = this.i18nService.getI18nInstance(session.locale);
    const rows: RecordImportRowDTO[] = [];

    // A page spans at most two chunks, each read once
    for (const chunkIndex of new Set(
      positions.map((position) =>
        Math.floor(position / RECORD_IMPORT_ROWS_PER_CHUNK),
      ),
    )) {
      const [chunkRows, chunkErrors] = await Promise.all([
        this.recordImportStorageService.readRowChunk(session, chunkIndex),
        this.recordImportStorageService.readErrorChunk<
          SpreadsheetImportRowErrors<SpreadsheetImportValidationMessage>
        >(session, chunkIndex),
      ]);
      const structuredRows = normalizeSpreadsheetImportRows(
        session.columns ?? [],
        chunkRows.map(({ cells }) => cells),
        metadata.spreadsheetImportFields,
      );

      for (const position of positions) {
        const indexInChunk =
          position - chunkIndex * RECORD_IMPORT_ROWS_PER_CHUNK;

        if (indexInChunk < 0 || indexInChunk >= chunkRows.length) {
          continue;
        }

        rows.push({
          rowNumber: chunkRows[indexInChunk].rowNumber,
          values: structuredRows[indexInChunk],
          errors: Object.fromEntries(
            Object.entries(chunkErrors.get(indexInChunk) ?? {}).map(
              ([fieldKey, { level, message }]) => [
                fieldKey,
                {
                  level,
                  message: i18n._(
                    getRecordImportValidationMessageDescriptor(message),
                  ),
                },
              ],
            ),
          ),
        });
      }
    }

    return {
      totalCount: onlyErrors ? errorRowPositions.length : rowCount,
      rows,
    };
  }

  async start({
    authContext,
    id,
    version,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
    version: number;
  }): Promise<RecordImportDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);
    const { metadata } = await this.buildContext(session);

    if (session.status !== 'VALIDATED') {
      throw new BadRequestException(t`The rows are still being checked.`);
    }

    if (
      !isDefined(session.columns) ||
      !isDefined(session.mappedFields) ||
      isRecordImportMappingOutdated(
        session.mappedFields,
        metadata.spreadsheetImportFields,
      )
    ) {
      throw new BadRequestException(
        t`The data model changed since the columns were matched. Match the columns again.`,
      );
    }

    const acquired =
      await this.recordImportSessionService.acquireWorkspaceLease({
        workspaceId: session.workspaceId,
        id,
        ttlMs: RECORD_IMPORT_LEASE_TTL_MS,
      });

    if (!acquired) {
      throw new ConflictException(
        t`An import is already running in this workspace. Please wait for it to finish.`,
      );
    }

    try {
      const importing = await this.compareAndUpdateOrThrow(
        session,
        version,
        ['VALIDATED'],
        (current) => ({
          ...current,
          status: 'IMPORTING',
          result: {
            totalRowCount: current.rowCount ?? 0,
            processedRowCount: 0,
            importedRecordCount: 0,
            skippedRowCount: 0,
            failedRowCount: 0,
          },
          reportFileId: undefined,
          errorMessage: undefined,
        }),
      );

      const jobId = await this.messageQueueService.add(
        'RunRecordImportJob',
        { workspaceId: importing.workspaceId, id: importing.id },
        { id: importing.id },
      );

      if (!isDefined(jobId)) {
        throw new ConflictException(t`The import could not be queued.`);
      }

      const updated = await this.recordImportSessionService.update(
        importing,
        (current) => ({ ...current, jobId }),
      );

      return this.toDTO(updated ?? importing);
    } catch (error) {
      await this.recordImportSessionService.updateWorkspaceLease({
        workspaceId: session.workspaceId,
        id,
        ttlMs: 0,
      });
      await this.recordImportSessionService.update(session, (current) =>
        current.status === 'IMPORTING'
          ? { ...current, status: 'VALIDATED' }
          : undefined,
      );

      throw error;
    }
  }

  // Stops a running import between batches (LIFE-6). A session that is not
  // importing is discarded with its files instead.
  async cancel({
    authContext,
    id,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
  }): Promise<boolean> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    if (session.status === 'IMPORTING' || session.status === 'CANCELLING') {
      await this.recordImportSessionService.update(session, (current) =>
        current.status === 'IMPORTING'
          ? { ...current, status: 'CANCELLING' }
          : undefined,
      );

      return true;
    }

    await this.recordImportSessionService.delete(session);
    await this.recordImportStorageService.deleteAll(session);

    return true;
  }

  async get({
    authContext,
    id,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
  }): Promise<RecordImportDTO> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    return this.getLiveDTO(session);
  }

  async stream({
    authContext,
    id,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
  }): Promise<AsyncIterableIterator<RecordImportDTO>> {
    const initialSession = await this.findOwnedSessionOrThrow(authContext, id);
    const service = this;

    async function* events(
      signal: AbortSignal,
    ): AsyncGenerator<RecordImportDTO> {
      let session: RecordImportSession | undefined = initialSession;

      while (!signal.aborted && isDefined(session)) {
        const update = await service.getLiveDTO(session);

        yield update;

        if (!RUNNING_STATUSES.includes(update.status as RecordImportStatus)) {
          return;
        }

        await setTimeout(RECORD_IMPORT_PROGRESS_INTERVAL_MS, undefined, {
          signal,
        });

        session = await service.recordImportSessionService.find(session);
      }
    }

    // Closing the connection only stops reporting: the import keeps running
    return wrapAsyncIteratorWithLifecycle(events, {
      heartbeatIntervalMs: RECORD_IMPORT_PROGRESS_INTERVAL_MS,
    });
  }

  async getReportUrl({
    authContext,
    id,
  }: {
    authContext: WorkspaceAuthContext;
    id: string;
  }): Promise<string> {
    const session = await this.findOwnedSessionOrThrow(authContext, id);

    if (!isDefined(session.reportFileId)) {
      throw new NotFoundException(t`This import has no report.`);
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId: session.reportFileId,
      workspaceId: session.workspaceId,
      fileFolder: FileFolder.RecordImport,
    });
  }

  // Resolves the requester again and re-checks every permission, so a job
  // or a late request never acts on access that was revoked (SEC-3, SEC-5).
  async buildContext(
    session: RecordImportSession,
  ): Promise<RecordImportContext> {
    const requester =
      await this.userWorkspaceService.buildUserAuthContextForWorkspaceMember(
        session,
      );

    if (!isDefined(requester)) {
      throw new ForbiddenException(
        t`The import requester is no longer a workspace member.`,
      );
    }

    const { restrictedFields } = await this.getObjectImportPermissionsOrThrow(
      requester,
      session.objectMetadataId,
    );

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(session.workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: session.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata) || !flatObjectMetadata.isActive) {
      throw new BadRequestException(t`This object is no longer available.`);
    }

    return {
      requester,
      metadata: buildRecordImportMetadata({
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        restrictedFields,
      }),
      queryRunnerContext: {
        authContext: requester,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        objectIdByNameSingular: buildObjectIdByNameMaps(flatObjectMetadataMaps)
          .idByNameSingular,
      },
    };
  }

  toDTO(
    session: RecordImportSession,
    jobProgress?: RecordImportJobProgress,
  ): RecordImportDTO {
    const result = session.result;
    const totalRowCount =
      jobProgress?.totalRowCount ??
      result?.totalRowCount ??
      session.rowCount ??
      0;
    const processedRowCount =
      jobProgress?.processedRowCount ?? result?.processedRowCount ?? 0;
    const isFinished =
      session.status === 'COMPLETED' || session.status === 'CANCELLED';

    return {
      id: session.id,
      version: session.version,
      status: session.status,
      fileName: session.fileName,
      sheetNames: session.sheetNames,
      sheetName: session.sheetName ?? null,
      rowCount: session.rowCount ?? null,
      isMapped: isDefined(session.columns),
      progress: isFinished
        ? 100
        : totalRowCount > 0
          ? Math.min(99, Math.floor((100 * processedRowCount) / totalRowCount))
          : 0,
      processedRowCount,
      totalRowCount,
      importedRecordCount:
        jobProgress?.importedRecordCount ?? result?.importedRecordCount ?? 0,
      skippedRowCount:
        jobProgress?.skippedRowCount ?? result?.skippedRowCount ?? 0,
      failedRowCount:
        jobProgress?.failedRowCount ?? result?.failedRowCount ?? 0,
      errorRowCount: session.errorRowCount ?? null,
      hasReport: isDefined(session.reportFileId),
      errorMessage: session.errorMessage ?? null,
    };
  }

  private async getLiveDTO(
    session: RecordImportSession,
  ): Promise<RecordImportDTO> {
    if (
      !RUNNING_STATUSES.includes(session.status) ||
      !isDefined(session.jobId)
    ) {
      return this.toDTO(session);
    }

    const jobs = await this.messageQueueService.getJobs<RecordImportSession>([
      session.jobId,
    ]);
    const job = jobs[session.jobId];
    const jobProgress =
      typeof job?.progress === 'object' && job.progress !== null
        ? (job.progress as RecordImportJobProgress)
        : undefined;

    if (isDefined(job) && job.state !== 'failed' && job.state !== 'completed') {
      return this.toDTO(session, jobProgress);
    }

    // The worker died without recording an outcome, e.g. on a restart: report
    // what was written instead of retrying, which could duplicate rows (LIFE-2).
    const interrupted = await this.recordImportSessionService.update(
      session,
      (current) => {
        if (!RUNNING_STATUSES.includes(current.status)) {
          return undefined;
        }

        if (current.status === 'PREPARING') {
          return {
            ...current,
            status: 'UPLOADED',
            errorMessage: t`Reading the file was interrupted. Please try again.`,
          };
        }

        if (current.status === 'VALIDATING') {
          return {
            ...current,
            status: 'READY',
            errorMessage: t`Checking the rows was interrupted. Please try again.`,
          };
        }

        const processedRowCount = jobProgress?.processedRowCount ?? 0;
        const totalRowCount = current.result?.totalRowCount ?? 0;
        const remainingRowCount = Math.max(
          0,
          totalRowCount - processedRowCount,
        );

        return {
          ...current,
          status: 'FAILED',
          result: {
            totalRowCount,
            processedRowCount,
            importedRecordCount: jobProgress?.importedRecordCount ?? 0,
            skippedRowCount: jobProgress?.skippedRowCount ?? 0,
            failedRowCount: jobProgress?.failedRowCount ?? 0,
          },
          errorMessage: t`The import was interrupted after ${processedRowCount} rows. ${remainingRowCount} rows were not imported.`,
        };
      },
    );

    if (session.status === 'IMPORTING' || session.status === 'CANCELLING') {
      await this.recordImportSessionService.updateWorkspaceLease({
        workspaceId: session.workspaceId,
        id: session.id,
        ttlMs: 0,
      });
    }

    return this.toDTO(interrupted ?? session);
  }

  private async readPreview(
    session: RecordImportSession,
    sheetName?: string,
  ): Promise<{ rows: string[][]; sheetNames: string[] }> {
    const rows: string[][] = [];
    let sheetNames: string[] = [];

    for await (const row of this.recordImportStorageService.readSourceRows({
      session,
      sheetName,
      previewRowCount: RECORD_IMPORT_PREVIEW_ROW_COUNT,
      onSheetNames: (names) => {
        sheetNames = names;
      },
    })) {
      rows.push(row.cells);

      if (rows.length >= RECORD_IMPORT_PREVIEW_ROW_COUNT) {
        break;
      }
    }

    return { rows, sheetNames };
  }

  private async assertCanImport(
    authContext: WorkspaceAuthContext,
    objectMetadataId: string,
  ): Promise<UserWorkspaceAuthContext> {
    if (
      !isUserAuthContext(authContext) ||
      isDefined(authContext.application) ||
      isDefined(authContext.viaApplication)
    ) {
      throw new ForbiddenException(t`Sign in to import records.`);
    }

    await this.getObjectImportPermissionsOrThrow(authContext, objectMetadataId);

    return authContext;
  }

  // IMPORT_CSV alone only hid the command menu item; the server now requires
  // it together with write access to the target object (SEC-1).
  private async getObjectImportPermissionsOrThrow(
    requester: UserWorkspaceAuthContext,
    objectMetadataId: string,
  ) {
    const { permissionFlags, objectsPermissions } =
      await this.permissionsService.getUserWorkspacePermissions({
        userWorkspaceId: requester.userWorkspaceId,
        workspaceId: requester.workspace.id,
      });
    const objectPermissions = objectsPermissions[objectMetadataId];

    if (
      permissionFlags[PermissionFlagType.IMPORT_CSV] !== true ||
      objectPermissions?.canUpdateObjectRecords !== true
    ) {
      throw new ForbiddenException(
        t`You do not have permission to import records.`,
      );
    }

    return objectPermissions;
  }

  private async findOwnedSessionOrThrow(
    authContext: WorkspaceAuthContext,
    id: string,
  ): Promise<RecordImportSession> {
    const session = isUserAuthContext(authContext)
      ? await this.recordImportSessionService.find({
          workspaceId: authContext.workspace.id,
          id,
        })
      : undefined;

    // Knowing a session id is not enough to use it (SEC-3)
    if (
      !isDefined(session) ||
      !isUserAuthContext(authContext) ||
      !this.isOwnedBy(session, authContext)
    ) {
      throw new NotFoundException(t`This import no longer exists.`);
    }

    return session;
  }

  private isOwnedBy(
    session: SessionOwner,
    authContext: UserWorkspaceAuthContext,
  ) {
    return (
      session.workspaceId === authContext.workspace.id &&
      session.userWorkspaceId === authContext.userWorkspaceId &&
      session.workspaceMemberId === authContext.workspaceMemberId
    );
  }

  private async compareAndUpdateOrThrow(
    session: RecordImportSession,
    version: number,
    allowedStatuses: RecordImportStatus[],
    update: (current: RecordImportSession) => RecordImportSession,
  ): Promise<RecordImportSession> {
    if (session.version !== version) {
      throw new ConflictException(
        t`This import was changed in another tab. Reload it to continue.`,
      );
    }

    if (!allowedStatuses.includes(session.status)) {
      throw new ConflictException(
        t`This import cannot be changed in its current state.`,
      );
    }

    const updated = await this.recordImportSessionService.compareAndUpdate(
      session,
      update,
    );

    if (!isDefined(updated)) {
      throw new ConflictException(
        t`This import was changed in another tab. Reload it to continue.`,
      );
    }

    return updated;
  }

  private assertValidSheetName(
    session: RecordImportSession,
    sheetName: string | undefined,
  ) {
    if (isDefined(sheetName) && !session.sheetNames.includes(sheetName)) {
      throw new BadRequestException(t`This sheet does not exist in the file.`);
    }
  }

  private assertValidTimeZone(timeZone: string) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone });
    } catch {
      throw new BadRequestException(t`The time zone is invalid.`);
    }
  }
}
