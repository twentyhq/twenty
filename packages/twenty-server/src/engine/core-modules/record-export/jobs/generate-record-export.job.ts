import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Readable } from 'stream';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  formatValueForCSV,
  isDefined,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_MAX_FILE_BYTES,
  RECORD_EXPORT_REQUESTER_REFRESH_INTERVAL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import {
  RecordExportWorkspaceService,
  type RecordExportQueryContext,
} from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import {
  type RecordExport,
  type RecordExportProgress,
} from 'src/engine/core-modules/record-export/types/record-export.type';
import { formatRecordExportRow } from 'src/engine/core-modules/record-export/utils/format-record-export-row.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type RecordExportFileProgress = RecordExportProgress & { size: number };

@Processor(MessageQueue.recordExportQueue)
export class GenerateRecordExportJob {
  private readonly logger = new Logger(GenerateRecordExportJob.name);

  constructor(
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly i18nService: I18nService,
  ) {}

  @Process(GenerateRecordExportJob.name)
  async handle(
    recordExport: RecordExport,
    { updateProgress, abortSignal }: MessageQueueJobProgressContext,
  ): Promise<void> {
    const progress: RecordExportFileProgress = {
      processedRecordCount: 0,
      totalRecordCount: null,
      size: 0,
    };
    let locale: keyof typeof APP_LOCALES = SOURCE_LOCALE;

    try {
      await this.recordExportWorkspaceService.assertPermissionsUnchanged(
        recordExport,
      );
      const signal = this.createAbortSignal(recordExport, abortSignal);
      await this.recordExportWorkspaceService.assertConnected(
        recordExport,
        signal,
      );
      const requester =
        await this.recordExportWorkspaceService.resolveRequester(recordExport);
      locale = requester.workspaceMember.locale;
      const context = await this.recordExportWorkspaceService.buildContext({
        parameters: recordExport.parameters,
        authContext: requester,
      });
      progress.totalRecordCount =
        await this.recordExportWorkspaceService.countRecords({
          parameters: recordExport.parameters,
          context,
        });
      await this.writeFile(
        recordExport,
        this.generateCsv({
          recordExport,
          context,
          progress,
          signal,
          updateProgress,
        }),
        progress,
        signal,
      );
      await this.recordExportWorkspaceService.assertPermissionsUnchanged(
        recordExport,
      );
      await this.recordExportWorkspaceService.assertConnected(
        recordExport,
        signal,
      );
      await updateProgress({
        processedRecordCount: progress.processedRecordCount,
        totalRecordCount: progress.totalRecordCount,
      });
    } catch (error) {
      await this.fileStorageService
        .deleteFile(
          this.recordExportWorkspaceService.getFileResource(recordExport),
        )
        .catch(() =>
          this.logger.warn(
            `Failed to remove partial export ${recordExport.id}`,
          ),
        );
      await updateProgress({
        processedRecordCount: progress.processedRecordCount,
        totalRecordCount: progress.totalRecordCount,
        errorMessage: this.i18nService
          .getI18nInstance(locale)
          ._(
            error instanceof RecordExportException
              ? error.userFriendlyMessage
              : msg`The export failed. Please try again or export fewer records.`,
          ),
      }).catch(() => {});
      throw error;
    }
  }

  private createAbortSignal(
    recordExport: RecordExport,
    abortSignal?: AbortSignal,
  ): AbortSignal {
    const remainingTime =
      RECORD_EXPORT_MAX_DURATION_MS - (Date.now() - recordExport.createdAt);
    if (remainingTime <= 0) {
      throw new RecordExportException(
        'Export duration limit exceeded',
        'DURATION_LIMIT_EXCEEDED',
        {
          userFriendlyMessage: msg`The export took too long. Please try exporting fewer records.`,
        },
      );
    }
    return AbortSignal.any([
      AbortSignal.timeout(remainingTime),
      ...(isDefined(abortSignal) ? [abortSignal] : []),
    ]);
  }

  private async writeFile(
    recordExport: RecordExport,
    csv: AsyncIterable<string>,
    progress: RecordExportFileProgress,
    signal: AbortSignal,
  ): Promise<void> {
    const resource =
      this.recordExportWorkspaceService.getFileResource(recordExport);
    const file = await this.fileStorageService.createPendingFile({
      ...resource,
      fileId: recordExport.id,
      size: 0,
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: true, toDelete: false },
    });
    const stream = Readable.from(csv, { signal });
    try {
      await this.fileStorageService.writeFileStream({
        ...resource,
        stream,
        mimeType: 'text/csv',
      });
      await this.fileRepository.update(
        recordExport.workspaceId,
        { id: file.id },
        {
          status: FILE_STATUS.UPLOADED,
          size: progress.size,
          mimeType: 'text/csv',
        },
      );
    } finally {
      stream.destroy();
    }
  }

  private async *generateCsv({
    recordExport,
    context,
    progress,
    signal,
    updateProgress,
  }: {
    recordExport: RecordExport;
    context: RecordExportQueryContext;
    progress: RecordExportFileProgress;
    signal: AbortSignal;
    updateProgress: MessageQueueJobProgressContext['updateProgress'];
  }): AsyncGenerator<string> {
    const header =
      '\uFEFF' +
      context.columns
        .map((column) =>
          formatValueForCSV(sanitizeValueForCSVExport(column.label)),
        )
        .join(',') +
      '\n';
    progress.size += Buffer.byteLength(header);
    yield header;
    let after: string | undefined;
    let lastRequesterRefreshAt = Date.now();

    do {
      await this.recordExportWorkspaceService.assertConnected(
        recordExport,
        signal,
      );
      await updateProgress({
        processedRecordCount: progress.processedRecordCount,
        totalRecordCount: progress.totalRecordCount,
      });
      await this.recordExportWorkspaceService.assertPermissionsUnchanged(
        recordExport,
      );
      if (
        Date.now() - lastRequesterRefreshAt >=
        RECORD_EXPORT_REQUESTER_REFRESH_INTERVAL_MS
      ) {
        context.queryRunnerContext.authContext =
          await this.recordExportWorkspaceService.resolveRequester(
            recordExport,
          );
        lastRequesterRefreshAt = Date.now();
      } else {
        await this.recordExportWorkspaceService.assertCanExport(
          context.queryRunnerContext.authContext,
        );
      }
      const { results } = await this.recordExportWorkspaceService.readPage({
        parameters: recordExport.parameters,
        context,
        after,
      });
      await this.recordExportWorkspaceService.assertPermissionsUnchanged(
        recordExport,
      );
      await this.recordExportWorkspaceService.assertConnected(
        recordExport,
        signal,
      );
      for (const record of results.records) {
        const row = formatRecordExportRow({ columns: context.columns, record });
        progress.size += Buffer.byteLength(row);
        if (progress.size > RECORD_EXPORT_MAX_FILE_BYTES) {
          throw new RecordExportException(
            'Export file size limit exceeded',
            'FILE_SIZE_LIMIT_EXCEEDED',
            {
              userFriendlyMessage: msg`The export file is too large. Please export fewer records.`,
            },
          );
        }
        yield row;
        progress.processedRecordCount++;
      }
      if (!results.pageInfo.hasNextPage) {
        break;
      }
      const endCursor = results.pageInfo.endCursor;
      if (!isDefined(endCursor) || endCursor === after) {
        throw new RecordExportException(
          'Export pagination did not advance',
          'PAGINATION_FAILED',
        );
      }
      after = endCursor;
    } while (true);
  }
}
