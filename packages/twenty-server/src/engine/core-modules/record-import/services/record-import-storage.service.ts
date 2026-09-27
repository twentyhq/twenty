import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { RECORD_IMPORT_MAX_WORKBOOK_BYTES } from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import {
  type RecordImportColumnSamples,
  type RecordImportErrorIndex,
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
    chunkIndex: number,
    rowErrors: [number, unknown][],
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      `${this.getWorkingFolderPath(session)}/errors/${chunkIndex}.json`,
      JSON.stringify(rowErrors),
    );
  }

  // Errors of the rows of a chunk that have any, by index in the chunk
  async readErrorChunk<TRowErrors>(
    session: SessionKey,
    chunkIndex: number,
  ): Promise<Map<number, TRowErrors>> {
    return new Map(
      JSON.parse(
        await this.readWorkingFile(
          session,
          `${this.getWorkingFolderPath(session)}/errors/${chunkIndex}.json`,
        ),
      ),
    );
  }

  async writeErrorIndex(
    session: SessionKey,
    errorIndex: RecordImportErrorIndex,
  ): Promise<void> {
    await this.writeWorkingFile(
      session,
      `${this.getWorkingFolderPath(session)}/errors/index.json`,
      JSON.stringify(errorIndex),
    );
  }

  async readErrorIndex(session: SessionKey): Promise<RecordImportErrorIndex> {
    return JSON.parse(
      await this.readWorkingFile(
        session,
        `${this.getWorkingFolderPath(session)}/errors/index.json`,
      ),
    );
  }

  writeReport(session: SessionKey, csv: string): Promise<FileEntity> {
    return this.writeWorkingFile(
      session,
      `${this.getWorkingFolderPath(session)}/report.csv`,
      csv,
    );
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
