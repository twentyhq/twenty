import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Readable } from 'node:stream';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { RECORD_IMPORT_MAX_WORKBOOK_BYTES } from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import {
  type RecordImportColumnSamples,
  type RecordImportErrorIndex,
  type RecordImportErrorRow,
  type RecordImportRow,
  type RecordImportSession,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';
import { detectRecordImportTextEncoding } from 'src/engine/core-modules/record-import/utils/detect-record-import-text-encoding.util';
import {
  guessRecordImportCsvDelimiter,
  readRecordImportCsvRows,
} from 'src/engine/core-modules/record-import/utils/read-record-import-csv-rows.util';
import { readRecordImportWorkbookRows } from 'src/engine/core-modules/record-import/utils/read-record-import-workbook-rows.util';
import { StreamSizeExceededError } from 'src/utils/stream-size-exceeded-error';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const TEXT_SNIFF_BYTE_COUNT = 64 * 1024;

type SessionKey = Pick<RecordImportSession, 'workspaceId' | 'id'>;

type SourceFile = Pick<
  RecordImportSession,
  'workspaceId' | 'sourceApplicationUniversalIdentifier' | 'sourceResourcePath'
>;

@Injectable()
export class RecordImportStorageService {
  private readonly logger = new Logger(RecordImportStorageService.name);

  constructor(private readonly fileStorageService: FileStorageService) {}

  readSourcePrefix(session: SourceFile, byteCount: number): Promise<Buffer> {
    return this.fileStorageService.readFilePrefix({
      ...this.getSourceResource(session),
      byteCount,
    });
  }

  async *readSourceRows({
    session,
    sheetName,
    previewRowCount,
    onSheetNames,
  }: {
    session: SourceFile & Pick<RecordImportSession, 'fileType'>;
    sheetName?: string;
    previewRowCount?: number;
    onSheetNames?: (sheetNames: string[]) => void;
  }): AsyncGenerator<RecordImportRow> {
    const resource = this.getSourceResource(session);

    if (session.fileType === 'csv') {
      const prefix = await this.fileStorageService.readFilePrefix({
        ...resource,
        byteCount: TEXT_SNIFF_BYTE_COUNT,
      });
      const encoding = detectRecordImportTextEncoding(prefix);

      onSheetNames?.([]);

      yield* readRecordImportCsvRows({
        stream: await this.fileStorageService.readFile(resource),
        encoding,
        delimiter: guessRecordImportCsvDelimiter(
          new TextDecoder(encoding).decode(prefix),
        ),
      });

      return;
    }

    let buffer: Buffer;

    try {
      buffer = await streamToBuffer(
        await this.fileStorageService.readFile(resource),
        RECORD_IMPORT_MAX_WORKBOOK_BYTES,
      );
    } catch (error) {
      if (error instanceof StreamSizeExceededError) {
        throw new RecordImportException(
          'Workbook exceeds the size limit',
          'FILE_LIMIT_EXCEEDED',
          {
            userFriendlyMessage: msg`Excel files are limited to 100 MB. Save the sheet as CSV to import a larger file.`,
          },
        );
      }

      throw error;
    }

    yield* readRecordImportWorkbookRows({
      buffer,
      sheetName,
      previewRowCount,
      onSheetNames,
    });
  }

  async writeRowChunk(
    session: SessionKey,
    chunkIndex: number,
    rows: RecordImportRow[],
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      this.getRowChunkPath(session, chunkIndex),
      rows
        .map(({ rowNumber, cells }) => JSON.stringify([rowNumber, cells]))
        .join('\n'),
    );
  }

  async readRowChunk(
    session: SessionKey,
    chunkIndex: number,
  ): Promise<RecordImportRow[]> {
    const content = await this.readWorkingFile(
      session,
      this.getRowChunkPath(session, chunkIndex),
    );

    return content
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        const [rowNumber, cells] = JSON.parse(line) as [number, string[]];

        return { rowNumber, cells };
      });
  }

  async writeColumnSamples(
    session: SessionKey,
    columnSamples: RecordImportColumnSamples,
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      `${this.getWorkingFolderPath(session)}/columns.json`,
      JSON.stringify(columnSamples),
    );
  }

  async readColumnSamples(
    session: SessionKey,
  ): Promise<RecordImportColumnSamples> {
    return JSON.parse(
      await this.readWorkingFile(
        session,
        `${this.getWorkingFolderPath(session)}/columns.json`,
      ),
    );
  }

  async writeErrorChunk(
    session: SessionKey,
    validationRunId: string,
    chunkIndex: number,
    rowErrors: [number, unknown][],
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      `${this.getErrorFolderPath(session, validationRunId)}/${chunkIndex}.json`,
      JSON.stringify(rowErrors),
    );
  }

  // Errors of the rows of a chunk that have any, by index in the chunk
  async readErrorChunk<TRowErrors>(
    session: SessionKey,
    validationRunId: string,
    chunkIndex: number,
  ): Promise<Map<number, TRowErrors>> {
    return new Map(
      JSON.parse(
        await this.readWorkingFile(
          session,
          `${this.getErrorFolderPath(session, validationRunId)}/${chunkIndex}.json`,
        ),
      ),
    );
  }

  async writeErrorRowPage(
    session: SessionKey,
    validationRunId: string,
    pageIndex: number,
    errorRows: RecordImportErrorRow<unknown>[],
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      `${this.getErrorFolderPath(session, validationRunId)}/rows/${pageIndex}.ndjson`,
      errorRows.map((errorRow) => JSON.stringify(errorRow)).join('\n'),
    );
  }

  async readErrorRowPage<TRowErrors>(
    session: SessionKey,
    validationRunId: string,
    pageIndex: number,
  ): Promise<RecordImportErrorRow<TRowErrors>[]> {
    const content = await this.readWorkingFile(
      session,
      `${this.getErrorFolderPath(session, validationRunId)}/rows/${pageIndex}.ndjson`,
    );

    return content
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as RecordImportErrorRow<TRowErrors>);
  }

  async writeErrorIndex(
    session: SessionKey,
    validationRunId: string,
    errorIndex: RecordImportErrorIndex,
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      `${this.getErrorFolderPath(session, validationRunId)}/index.json`,
      JSON.stringify(errorIndex),
    );
  }

  async readErrorIndex(
    session: SessionKey,
    validationRunId: string,
  ): Promise<RecordImportErrorIndex> {
    return JSON.parse(
      await this.readWorkingFile(
        session,
        `${this.getErrorFolderPath(session, validationRunId)}/index.json`,
      ),
    );
  }

  async deleteErrorFiles(
    session: SessionKey,
    validationRunId: string,
  ): Promise<void> {
    await this.fileStorageService
      .deleteFolder({
        workspaceId: session.workspaceId,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: FileFolder.RecordImport,
        folderPath: this.getErrorFolderPath(session, validationRunId),
      })
      .catch((error) =>
        this.logger.warn(
          `Failed to delete errors of import ${session.id}: ${error.message}`,
        ),
      );
  }

  async writeReportPart(
    session: SessionKey,
    partIndex: number,
    lines: string[],
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      this.getReportPartPath(session, partIndex),
      lines.join('\n') + '\n',
    );
  }

  // Streams the parts written during the import into one file, so the
  // report is never held in memory whole
  async writeReport(
    session: SessionKey,
    header: string,
    partCount: number,
  ): Promise<string> {
    const resource = this.getResource(
      session.workspaceId,
      `${this.getWorkingFolderPath(session)}/report.csv`,
    );
    const file = await this.fileStorageService.createPendingFile({
      ...resource,
      fileId: v4(),
      size: 0,
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: true, toDelete: false },
    });
    let size = 0;
    const storageService = this;

    async function* content() {
      const headerBuffer = Buffer.from(header, 'utf8');

      size += headerBuffer.length;
      yield headerBuffer;

      for (let partIndex = 0; partIndex < partCount; partIndex++) {
        const part = await streamToBuffer(
          await storageService.fileStorageService.readFile(
            storageService.getResource(
              session.workspaceId,
              storageService.getReportPartPath(session, partIndex),
            ),
          ),
        );

        size += part.length;
        yield part;
      }
    }

    await this.fileStorageService.writeFileStream({
      ...resource,
      stream: Readable.from(content()),
      mimeType: 'text/csv',
    });
    await this.fileStorageService.markFileUploaded({
      workspaceId: session.workspaceId,
      applicationId: file.applicationId,
      fileId: file.id,
      chargedSize: 0,
      size,
      mimeType: 'text/csv',
    });

    return file.id;
  }

  async deleteWorkingFiles(session: SessionKey): Promise<void> {
    await this.fileStorageService.deleteFolder({
      workspaceId: session.workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.RecordImport,
      folderPath: this.getWorkingFolderPath(session),
    });
  }

  async deleteAll(session: SessionKey): Promise<void> {
    await this.deleteWorkingFiles(session);
    await this.fileStorageService
      .deleteByFileId({
        fileId: session.id,
        workspaceId: session.workspaceId,
        fileFolder: FileFolder.RecordImport,
      })
      .catch((error) =>
        this.logger.warn(
          `Failed to delete import source ${session.id}: ${error.message}`,
        ),
      );
  }

  private writeWorkingFile(
    session: SessionKey,
    resourcePath: string,
    content: string,
  ): Promise<FileEntity> {
    return this.fileStorageService.writeFile({
      ...this.getResource(session.workspaceId, resourcePath),
      sourceFile: Buffer.from(content, 'utf8'),
      settings: { isTemporaryFile: true, toDelete: false },
    });
  }

  private async readWorkingFile(
    session: SessionKey,
    resourcePath: string,
  ): Promise<string> {
    const buffer = await streamToBuffer(
      await this.fileStorageService.readFile(
        this.getResource(session.workspaceId, resourcePath),
      ),
    );

    return buffer.toString('utf8');
  }

  private getSourceResource(session: SourceFile) {
    return {
      workspaceId: session.workspaceId,
      applicationUniversalIdentifier:
        session.sourceApplicationUniversalIdentifier,
      fileFolder: FileFolder.RecordImport,
      resourcePath: session.sourceResourcePath,
    };
  }

  // Not "<id>/": folder cleanup matches paths by prefix, and "<id>" alone
  // would also match the uploaded source "<id>.csv"
  private getWorkingFolderPath(session: SessionKey) {
    return `${session.id}-working`;
  }

  private getErrorFolderPath(session: SessionKey, validationRunId: string) {
    return `${this.getWorkingFolderPath(session)}/errors/${validationRunId}`;
  }

  private getReportPartPath(session: SessionKey, partIndex: number) {
    return `${this.getWorkingFolderPath(session)}/report/${partIndex}.csv`;
  }

  private getRowChunkPath(session: SessionKey, chunkIndex: number) {
    return `${this.getWorkingFolderPath(session)}/rows/${chunkIndex}.ndjson`;
  }

  private getResource(workspaceId: string, resourcePath: string) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.RecordImport,
      resourcePath,
    };
  }
}
