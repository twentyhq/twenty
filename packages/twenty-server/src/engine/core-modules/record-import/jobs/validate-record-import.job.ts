import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECORD_IMPORT_ERROR_ROWS_PER_PAGE } from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import { RecordImportValidationWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import-validation.workspace-service';
import { RecordImportWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import.workspace-service';
import {
  type RecordImportErrorIndex,
  type RecordImportErrorRow,
  type RecordImportSession,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';

type ValidateRecordImportJobData = Pick<
  RecordImportSession,
  'workspaceId' | 'id'
> & {
  validationRunId: string;
  // The run whose results this one replaces, deleted once they are unused
  previousValidationRunId?: string;
};

class RecordImportValidationSuperseded extends Error {}

// Validates every row against the mapping and stores errors per chunk with
// an index of the rows that have any, so the review grid can page through
// all rows or only rows with errors without scanning the file.
@Processor(MessageQueue.recordImportQueue)
export class ValidateRecordImportJob {
  private readonly logger = new Logger(ValidateRecordImportJob.name);

  constructor(
    private readonly recordImportSessionService: RecordImportSessionService,
    private readonly recordImportStorageService: RecordImportStorageService,
    private readonly recordImportValidationWorkspaceService: RecordImportValidationWorkspaceService,
    private readonly recordImportWorkspaceService: RecordImportWorkspaceService,
    private readonly i18nService: I18nService,
  ) {}

  @Process(ValidateRecordImportJob.name)
  async handle(
    {
      workspaceId,
      id,
      validationRunId,
      previousValidationRunId,
    }: ValidateRecordImportJobData,
    { updateProgress }: MessageQueueJobProgressContext,
  ): Promise<void> {
    const session = await this.recordImportSessionService.find({
      workspaceId,
      id,
    });

    if (isDefined(previousValidationRunId)) {
      await this.recordImportStorageService.deleteErrorFiles(
        { workspaceId, id },
        previousValidationRunId,
      );
    }

    if (!this.isCurrentRun(session, validationRunId)) {
      return;
    }

    try {
      const errorRowCount = await this.validate(
        session,
        validationRunId,
        updateProgress,
      );

      await this.recordImportSessionService.update(session, (current) =>
        this.isCurrentRun(current, validationRunId)
          ? { ...current, status: 'VALIDATED', errorRowCount }
          : undefined,
      );
    } catch (error) {
      await this.recordImportStorageService.deleteErrorFiles(
        session,
        validationRunId,
      );

      if (error instanceof RecordImportValidationSuperseded) {
        return;
      }

      this.logger.warn(`Validating import ${id} failed: ${error.message}`);

      const errorMessage = this.i18nService
        .getI18nInstance(session.locale)
        ._(
          error instanceof RecordImportException
            ? error.userFriendlyMessage
            : msg`The rows could not be checked. Please try again.`,
        );

      await this.recordImportSessionService.update(session, (current) =>
        this.isCurrentRun(current, validationRunId)
          ? { ...current, status: 'READY', errorMessage }
          : undefined,
      );
    }
  }

  private async validate(
    session: RecordImportSession,
    validationRunId: string,
    updateProgress: MessageQueueJobProgressContext['updateProgress'],
  ): Promise<number> {
    const context =
      await this.recordImportWorkspaceService.buildContext(session);
    let errorRowCount = 0;
    let processedRowCount = 0;
    let errorRowsInPage: RecordImportErrorRow<unknown>[] = [];
    let errorIndex: RecordImportErrorIndex = { rowCount: 0, pageCount: 0 };

    const flushErrorRows = async () => {
      if (errorRowsInPage.length === 0) {
        return;
      }

      await this.recordImportStorageService.writeErrorRowPage(
        session,
        validationRunId,
        errorIndex.pageCount,
        errorRowsInPage,
      );
      errorIndex = {
        rowCount: errorIndex.rowCount + errorRowsInPage.length,
        pageCount: errorIndex.pageCount + 1,
      };
      errorRowsInPage = [];
    };

    const assertIsCurrentRun = async () => {
      if (
        !this.isCurrentRun(
          await this.recordImportSessionService.find(session),
          validationRunId,
        )
      ) {
        throw new RecordImportValidationSuperseded();
      }
    };

    for await (const {
      chunkIndex,
      rows,
    } of this.recordImportValidationWorkspaceService.validateChunks(
      session,
      context,
      assertIsCurrentRun,
    )) {
      const rowErrors: [number, unknown][] = [];

      for (const [indexInChunk, row] of rows.entries()) {
        const cellErrors = Object.values(row.errors);

        if (row.isDeleted || cellErrors.length === 0) {
          continue;
        }

        rowErrors.push([indexInChunk, row.errors]);
        errorRowsInPage.push({
          rowNumber: row.rowNumber,
          cells: row.cells,
          errors: row.errors,
        });

        if (errorRowsInPage.length >= RECORD_IMPORT_ERROR_ROWS_PER_PAGE) {
          await flushErrorRows();
        }

        if (cellErrors.some(({ level }) => level === 'error')) {
          errorRowCount++;
        }
      }

      await this.recordImportStorageService.writeErrorChunk(
        session,
        validationRunId,
        chunkIndex,
        rowErrors,
      );

      processedRowCount += rows.length;
      await updateProgress({
        processedRowCount,
        totalRowCount: session.rowCount ?? 0,
      });

      await assertIsCurrentRun();
    }

    await flushErrorRows();
    await this.recordImportStorageService.writeErrorIndex(
      session,
      validationRunId,
      errorIndex,
    );

    return errorRowCount;
  }

  private isCurrentRun(
    session: RecordImportSession | undefined,
    validationRunId: string,
  ): session is RecordImportSession {
    return (
      isDefined(session) &&
      session.status === 'VALIDATING' &&
      session.validationRunId === validationRunId
    );
  }
}
