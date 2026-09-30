import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { cleanZWJFromImportedValue, isDefined } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  RECORD_IMPORT_EXAMPLE_ROW_COUNT,
  RECORD_IMPORT_MAX_DISTINCT_VALUES_PER_COLUMN,
  RECORD_IMPORT_MAX_ROW_COUNT,
  RECORD_IMPORT_ROWS_PER_CHUNK,
} from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import {
  type RecordImportColumnSamples,
  type RecordImportRow,
  type RecordImportSession,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';

type PrepareRecordImportJobData = Pick<
  RecordImportSession,
  'workspaceId' | 'id'
>;

class RecordImportPreparationCancelled extends Error {}

// Reads the chosen sheet once and stores its rows in chunks keyed by their
// original row numbers, so validation, review and import never parse the
// source file again.
@Processor(MessageQueue.recordImportQueue)
export class PrepareRecordImportJob {
  private readonly logger = new Logger(PrepareRecordImportJob.name);

  constructor(
    private readonly recordImportSessionService: RecordImportSessionService,
    private readonly recordImportStorageService: RecordImportStorageService,
    private readonly i18nService: I18nService,
  ) {}

  @Process(PrepareRecordImportJob.name)
  async handle(
    { workspaceId, id }: PrepareRecordImportJobData,
    { updateProgress }: MessageQueueJobProgressContext,
  ): Promise<void> {
    const session = await this.recordImportSessionService.find({
      workspaceId,
      id,
    });

    if (!isDefined(session) || session.status !== 'PREPARING') {
      return;
    }

    try {
      const {
        headerValues,
        rowCount,
        chunkCount,
        chunkFirstRowNumbers,
        columnSamples,
      } = await this.writeRowChunks(session, updateProgress);

      await this.recordImportStorageService.writeColumnSamples(
        session,
        columnSamples,
      );

      await this.recordImportSessionService.update(session, (current) =>
        current.status === 'PREPARING'
          ? {
              ...current,
              status: 'READY',
              headerValues,
              rowCount,
              chunkCount,
              chunkFirstRowNumbers,
              deletedRowCount: 0,
            }
          : undefined,
      );
    } catch (error) {
      if (error instanceof RecordImportPreparationCancelled) {
        return;
      }

      this.logger.warn(`Preparing import ${id} failed: ${error.message}`);

      const errorMessage = this.i18nService
        .getI18nInstance(session.locale)
        ._(
          error instanceof RecordImportException
            ? error.userFriendlyMessage
            : msg`Reading the file failed. Please try again.`,
        );

      await this.recordImportSessionService.update(session, (current) =>
        current.status === 'PREPARING'
          ? { ...current, status: 'UPLOADED', errorMessage }
          : undefined,
      );
    }
  }

  private async writeRowChunks(
    session: RecordImportSession,
    updateProgress: MessageQueueJobProgressContext['updateProgress'],
  ) {
    await this.recordImportStorageService.deleteWorkingFiles(session);

    const headerRowIndex = session.headerRowIndex ?? 0;
    let headerValues: string[] | undefined;
    let parsedRowIndex = -1;
    let rowCount = 0;
    let chunkCount = 0;
    let chunk: RecordImportRow[] = [];
    const chunkFirstRowNumbers: number[] = [];
    const exampleRows: string[][] = [];
    const distinctValuesByColumn: Set<string>[] = [];

    const flush = async () => {
      if (chunk.length === 0) {
        return;
      }

      await this.recordImportStorageService.writeRowChunk(
        session,
        chunkCount,
        chunk,
      );
      chunkFirstRowNumbers.push(chunk[0].rowNumber);
      chunkCount++;
      chunk = [];

      await updateProgress({ processedRowCount: rowCount, totalRowCount: 0 });

      const current = await this.recordImportSessionService.find(session);

      if (current?.status !== 'PREPARING') {
        throw new RecordImportPreparationCancelled();
      }
    };

    for await (const row of this.recordImportStorageService.readSourceRows({
      session,
      sheetName: session.fileType === 'csv' ? undefined : session.sheetName,
    })) {
      parsedRowIndex++;

      if (parsedRowIndex < headerRowIndex) {
        continue;
      }

      const cells = row.cells.map(cleanZWJFromImportedValue);

      if (parsedRowIndex === headerRowIndex) {
        headerValues = cells;
        distinctValuesByColumn.push(...cells.map(() => new Set<string>()));
        continue;
      }

      rowCount++;

      if (rowCount > RECORD_IMPORT_MAX_ROW_COUNT) {
        throw new RecordImportException(
          'Too many rows',
          'FILE_LIMIT_EXCEEDED',
          {
            userFriendlyMessage: msg`The sheet has too many rows. The limit is ${RECORD_IMPORT_MAX_ROW_COUNT}.`,
          },
        );
      }

      if (exampleRows.length < RECORD_IMPORT_EXAMPLE_ROW_COUNT) {
        exampleRows.push(cells);
      }

      distinctValuesByColumn.forEach((distinctValues, columnIndex) => {
        const cell = cells[columnIndex];

        if (
          isDefined(cell) &&
          cell !== '' &&
          distinctValues.size < RECORD_IMPORT_MAX_DISTINCT_VALUES_PER_COLUMN
        ) {
          distinctValues.add(cell);
        }
      });

      chunk.push({ rowNumber: row.rowNumber, cells });

      if (chunk.length >= RECORD_IMPORT_ROWS_PER_CHUNK) {
        await flush();
      }
    }

    await flush();

    if (!isDefined(headerValues)) {
      throw new RecordImportException('Header row not found', 'INVALID_INPUT', {
        userFriendlyMessage: msg`The selected header row was not found in the file.`,
      });
    }

    const columnSamples: RecordImportColumnSamples = {
      headerValues,
      exampleRows,
      distinctValuesByColumn: distinctValuesByColumn.map((distinctValues) => [
        ...distinctValues,
      ]),
    };

    return {
      headerValues,
      rowCount,
      chunkCount,
      chunkFirstRowNumbers,
      columnSamples,
    };
  }
}
