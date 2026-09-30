import { Injectable, Logger } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { setTimeout } from 'node:timers/promises';
import {
  buildRecordFromImportedStructuredRow,
  formatValueForCSV,
  isDefined,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RECORD_IMPORT_BATCH_SIZE,
  RECORD_IMPORT_DOWNSTREAM_BACKOFF_MS,
  RECORD_IMPORT_LEASE_TTL_MS,
  RECORD_IMPORT_MAX_DOWNSTREAM_WAITING_JOBS,
  RECORD_IMPORT_PROGRESS_INTERVAL_MS,
  RECORD_IMPORT_REQUESTER_REFRESH_INTERVAL_MS,
} from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import { RecordImportValidationWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import-validation.workspace-service';
import {
  type RecordImportContext,
  RecordImportWorkspaceService,
} from 'src/engine/core-modules/record-import/services/record-import.workspace-service';
import {
  type RecordImportResult,
  type RecordImportSession,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';
import { getRecordImportValidationMessageDescriptor } from 'src/engine/core-modules/record-import/utils/get-record-import-validation-message-descriptor.util';
import { isRecordImportMappingOutdated } from 'src/engine/core-modules/record-import/utils/parse-record-import-columns.util';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

type PendingRecord = { rowNumber: number; record: Record<string, unknown> };

type ReportedRow = { rowNumber: number; messages: MessageDescriptor[] };

// Reported rows are written out after each chunk, so memory holds at most
// one chunk of them however many rows are skipped or fail
type ImportReport = { pendingRows: ReportedRow[]; partCount: number };

// Unique-constraint and relation lookup failures share one message, so the
// report never confirms that a record the requester cannot see exists.
const ROW_WRITE_FAILED_MESSAGE = msg`This row could not be saved. It may conflict with an existing record or reference a record that does not exist.`;

class RecordImportCancelled extends Error {}

@Injectable()
export class RecordImportRunnerWorkspaceService {
  private readonly logger = new Logger(RecordImportRunnerWorkspaceService.name);

  constructor(
    private readonly recordImportSessionService: RecordImportSessionService,
    private readonly recordImportStorageService: RecordImportStorageService,
    private readonly recordImportValidationWorkspaceService: RecordImportValidationWorkspaceService,
    private readonly recordImportWorkspaceService: RecordImportWorkspaceService,
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
    private readonly i18nService: I18nService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly entityEventsQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
  ) {}

  async run(
    session: RecordImportSession,
    { updateProgress, abortSignal }: MessageQueueJobProgressContext,
  ): Promise<void> {
    const result: RecordImportResult = {
      totalRowCount: (session.rowCount ?? 0) - (session.deletedRowCount ?? 0),
      processedRowCount: 0,
      importedRecordCount: 0,
      skippedRowCount: 0,
      failedRowCount: 0,
    };
    const report: ImportReport = { pendingRows: [], partCount: 0 };
    let status: RecordImportSession['status'] = 'COMPLETED';
    let errorMessage: string | undefined;

    try {
      const context =
        await this.recordImportWorkspaceService.buildContext(session);

      if (
        !isDefined(session.columns) ||
        !isDefined(session.mappedFields) ||
        isRecordImportMappingOutdated(
          session.mappedFields,
          context.metadata.spreadsheetImportFields,
        )
      ) {
        throw new RecordImportException(
          'Mapping is outdated',
          'MAPPING_OUTDATED',
          {
            userFriendlyMessage: msg`The data model changed since the columns were matched. Match the columns again.`,
          },
        );
      }

      await this.importRows({
        session,
        context,
        result,
        report,
        updateProgress,
        abortSignal,
      });
    } catch (error) {
      if (error instanceof RecordImportCancelled) {
        status = 'CANCELLED';
      } else {
        this.logger.warn(`Import ${session.id} failed: ${error.message}`);
        status = 'FAILED';
        errorMessage = this.translate(
          session,
          error instanceof RecordImportException
            ? error.userFriendlyMessage
            : msg`The import stopped because of an unexpected error.`,
        );
      }
    }

    const reportFileId = await this.writeReport(session, report).catch(
      (error) => {
        this.logger.warn(
          `Failed to write report of import ${session.id}: ${error.message}`,
        );

        return undefined;
      },
    );

    await this.recordImportSessionService.update(session, (current) => ({
      ...current,
      // A cancel requested during the last batch has no checkpoint left to
      // observe it
      status:
        status === 'COMPLETED' && current.status === 'CANCELLING'
          ? 'CANCELLED'
          : status,
      result,
      reportFileId,
      errorMessage,
    }));

    await this.recordImportSessionService.updateWorkspaceLease({
      workspaceId: session.workspaceId,
      id: session.id,
      ttlMs: 0,
    });

    await updateProgress({ ...result });
  }

  private async importRows({
    session,
    context,
    result,
    report,
    updateProgress,
    abortSignal,
  }: {
    session: RecordImportSession;
    context: RecordImportContext;
    result: RecordImportResult;
    report: ImportReport;
    updateProgress: MessageQueueJobProgressContext['updateProgress'];
    abortSignal?: AbortSignal;
  }) {
    const { spreadsheetImportFields } = context.metadata;
    let lastProgressAt = 0;
    let lastRequesterRefreshAt = Date.now();

    // Also runs while the import waits for downstream queues, so a pause
    // can be cancelled and never lets the workspace lease expire
    const keepAlive = async () => {
      abortSignal?.throwIfAborted();

      const current = await this.recordImportSessionService.find(session);

      if (current?.status !== 'IMPORTING') {
        throw new RecordImportCancelled();
      }

      if (
        !(await this.recordImportSessionService.updateWorkspaceLease({
          workspaceId: session.workspaceId,
          id: session.id,
          ttlMs: RECORD_IMPORT_LEASE_TTL_MS,
        }))
      ) {
        const reacquired =
          await this.recordImportSessionService.acquireWorkspaceLease({
            workspaceId: session.workspaceId,
            id: session.id,
            ttlMs: RECORD_IMPORT_LEASE_TTL_MS,
          });

        if (!reacquired) {
          throw new RecordImportException(
            'Workspace import lease held by another import',
            'IMPORT_ALREADY_RUNNING',
            {
              userFriendlyMessage: msg`Another import started in this workspace, so this one was stopped.`,
            },
          );
        }
      }

      await this.recordImportSessionService.touch(session);
    };

    const checkpoint = async () => {
      await keepAlive();

      // Membership and permissions are re-checked while the import runs,
      // not only when it starts
      if (
        Date.now() - lastRequesterRefreshAt >=
        RECORD_IMPORT_REQUESTER_REFRESH_INTERVAL_MS
      ) {
        const refreshed =
          await this.recordImportWorkspaceService.buildContext(session);

        context.requester = refreshed.requester;
        context.queryRunnerContext = refreshed.queryRunnerContext;
        lastRequesterRefreshAt = Date.now();
      }

      await this.waitForDownstreamQueues(keepAlive, abortSignal);

      if (Date.now() - lastProgressAt >= RECORD_IMPORT_PROGRESS_INTERVAL_MS) {
        await updateProgress({ ...result });
        lastProgressAt = Date.now();
      }
    };

    for await (const {
      rows,
    } of this.recordImportValidationWorkspaceService.validateChunks(
      session,
      context,
    )) {
      const pendingRecords: PendingRecord[] = [];

      for (const { rowNumber, structuredRow, errors, isDeleted } of rows) {
        if (isDeleted) {
          continue;
        }

        // Warnings do not block a row, as in the browser import
        const blockingMessages = Object.values(errors)
          .filter(({ level }) => level === 'error')
          .map(({ message }) =>
            getRecordImportValidationMessageDescriptor(message),
          );

        if (blockingMessages.length > 0) {
          result.skippedRowCount++;
          report.pendingRows.push({ rowNumber, messages: blockingMessages });
          continue;
        }

        pendingRecords.push({
          rowNumber,
          record: buildRecordFromImportedStructuredRow({
            importedStructuredRow: structuredRow,
            fieldMetadataItems: context.metadata.importableFieldMetadataItems,
            spreadsheetImportFields,
            timeZone: session.timeZone,
          }),
        });
      }

      result.processedRowCount +=
        rows.filter(({ isDeleted }) => !isDeleted).length -
        pendingRecords.length;

      for (
        let batchStart = 0;
        batchStart < pendingRecords.length;
        batchStart += RECORD_IMPORT_BATCH_SIZE
      ) {
        await checkpoint();

        const batch = pendingRecords.slice(
          batchStart,
          batchStart + RECORD_IMPORT_BATCH_SIZE,
        );
        const failedRowNumbers = await this.writeBatch(
          context,
          batch,
          checkpoint,
        );

        result.importedRecordCount += batch.length - failedRowNumbers.length;
        result.failedRowCount += failedRowNumbers.length;
        result.processedRowCount += batch.length;
        report.pendingRows.push(
          ...failedRowNumbers.map((rowNumber) => ({
            rowNumber,
            messages: [ROW_WRITE_FAILED_MESSAGE],
          })),
        );
      }

      await this.flushReport(session, report);
    }
  }

  // One database error fails a whole batch, so failing batches are split
  // until the failing rows are isolated. Returns their row numbers.
  private async writeBatch(
    context: RecordImportContext,
    batch: PendingRecord[],
    checkpoint: () => Promise<void>,
  ): Promise<number[]> {
    try {
      // A failure after the insert, e.g. while reading the records back, must
      // roll it back, or the retry below would insert rows without a unique
      // key a second time
      await withWorkspaceAuthContext(context.requester, () =>
        this.workspaceOrmManager.executeInWorkspaceContext(
          () =>
            this.workspaceOrmManager.runInWorkspaceTransaction(
              (transactionScope) =>
                this.commonCreateManyQueryRunnerService.execute(
                  {
                    data: batch.map(({ record }) => record),
                    upsert: true,
                    selectedFields: { id: true },
                  },
                  { ...context.queryRunnerContext, transactionScope },
                ),
            ),
          context.requester,
        ),
      );

      return [];
    } catch (error) {
      if (
        error instanceof UsageLimitException &&
        error.code === UsageLimitExceptionCode.RATE_LIMITED
      ) {
        // The API speed limit paces imports like any other client
        await setTimeout(error.exhaustedScope?.retryAfterMs ?? 1000);
        await checkpoint();

        return this.writeBatch(context, batch, checkpoint);
      }

      if (
        error instanceof UsageLimitException ||
        error instanceof PermissionsException
      ) {
        throw error;
      }

      if (batch.length === 1) {
        this.logger.debug(
          `Import row ${batch[0].rowNumber} failed: ${error.message}`,
        );

        return [batch[0].rowNumber];
      }

      const middle = Math.ceil(batch.length / 2);

      return [
        ...(await this.writeBatch(context, batch.slice(0, middle), checkpoint)),
        ...(await this.writeBatch(context, batch.slice(middle), checkpoint)),
      ];
    }
  }

  // Each written record feeds event and webhook queues shared by all
  // workspaces; the import waits while they are backed up. The
  // workflow queue is left out: runs are throttled by the workflow engine,
  // which drains it far slower than an import fills it, so waiting on it
  // would stall any import into an object with record-created workflows.
  private async waitForDownstreamQueues(
    keepAlive: () => Promise<void>,
    abortSignal?: AbortSignal,
  ) {
    const queues = [this.entityEventsQueueService, this.webhookQueueService];

    while (true) {
      const waitingJobCounts = await Promise.all(
        queues.map((queue) => queue.getWaitingJobCount()),
      );

      if (
        waitingJobCounts.every(
          (waitingJobCount) =>
            waitingJobCount < RECORD_IMPORT_MAX_DOWNSTREAM_WAITING_JOBS,
        )
      ) {
        return;
      }

      await setTimeout(RECORD_IMPORT_DOWNSTREAM_BACKOFF_MS, undefined, {
        signal: abortSignal,
      });
      await keepAlive();
    }
  }

  private async flushReport(
    session: RecordImportSession,
    report: ImportReport,
  ): Promise<void> {
    if (report.pendingRows.length === 0) {
      return;
    }

    const i18n = this.i18nService.getI18nInstance(session.locale);
    const lines = report.pendingRows
      .sort((rowA, rowB) => rowA.rowNumber - rowB.rowNumber)
      .map(
        ({ rowNumber, messages }) =>
          `${rowNumber},${formatValueForCSV(
            sanitizeValueForCSVExport(
              messages.map((message) => i18n._(message)).join('; '),
            ),
          )}`,
      );

    await this.recordImportStorageService.writeReportPart(
      session,
      report.partCount,
      lines,
    );
    report.partCount++;
    report.pendingRows = [];
  }

  // Skipped and failed rows with their original row numbers. Values
  // are escaped against formula injection since the file opens in Excel.
  private async writeReport(
    session: RecordImportSession,
    report: ImportReport,
  ): Promise<string | undefined> {
    await this.flushReport(session, report);

    if (report.partCount === 0) {
      return undefined;
    }

    const i18n = this.i18nService.getI18nInstance(session.locale);
    const header = [i18n._(msg`Row`), i18n._(msg`Errors`)]
      .map((label) => formatValueForCSV(sanitizeValueForCSVExport(label)))
      .join(',');

    return this.recordImportStorageService.writeReport(
      session,
      '\uFEFF' + header + '\n',
      report.partCount,
    );
  }

  private translate(session: RecordImportSession, message: MessageDescriptor) {
    return this.i18nService.getI18nInstance(session.locale)._(message);
  }
}
