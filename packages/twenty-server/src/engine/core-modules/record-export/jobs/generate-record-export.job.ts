import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { Readable } from 'stream';
import {
  formatValueForCSV,
  isDefined,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_MAX_FILE_BYTES,
  RECORD_EXPORT_PROGRESS_INTERVAL_MS,
  RECORD_EXPORT_REQUESTER_REFRESH_INTERVAL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import {
  type RecordExport,
  type RecordExportResult,
} from 'src/engine/core-modules/record-export/types/record-export.type';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { formatRecordExportRow } from 'src/engine/core-modules/record-export/utils/format-record-export-row.util';

@Processor(MessageQueue.recordExportQueue)
export class GenerateRecordExportJob {
  private readonly logger = new Logger(GenerateRecordExportJob.name);

  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly i18nService: I18nService,
  ) {}

  @Process(GenerateRecordExportJob.name)
  async handle(
    recordExport: RecordExport,
    { updateProgress, abortSignal }: MessageQueueJobProgressContext,
  ): Promise<RecordExportResult> {
    const { workspaceId } = recordExport;
    const fileId = v4();
    const filePath = `${recordExport.id}/${fileId}.csv`;
    let processedRecordCount = 0;
    let totalRecordCount: number | null = null;
    let stream: Readable | undefined;
    let locale: keyof typeof APP_LOCALES = SOURCE_LOCALE;

    try {
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

      const signal = AbortSignal.any([
        AbortSignal.timeout(remainingTime),
        ...(isDefined(abortSignal) ? [abortSignal] : []),
      ]);
      const assertConnected = async () => {
        signal.throwIfAborted();
        if (!(await this.recordExportCacheService.isConnected(recordExport))) {
          throw new RecordExportException(
            'Export connection closed',
            'CONNECTION_CLOSED',
          );
        }
      };
      await assertConnected();
      const requester =
        await this.recordExportQueryWorkspaceService.resolveRequester(
          recordExport,
        );
      locale = requester.workspaceMember.locale;
      const context = await this.recordExportQueryWorkspaceService.buildContext(
        { parameters: recordExport.parameters, authContext: requester },
      );
      const recordExportQueryWorkspaceService =
        this.recordExportQueryWorkspaceService;
      let lastProgressAt = 0;
      let lastRequesterRefreshAt = Date.now();
      let bytes = 0;

      const reportProgress = async () => {
        await assertConnected();
        await updateProgress({ processedRecordCount, totalRecordCount });
        lastProgressAt = Date.now();
      };

      totalRecordCount = await recordExportQueryWorkspaceService.countRecords({
        parameters: recordExport.parameters,
        context,
      });
      await reportProgress();

      async function* generateCsv() {
        const header =
          '\uFEFF' +
          context.columns
            .map((column) =>
              formatValueForCSV(sanitizeValueForCSVExport(column.label)),
            )
            .join(',') +
          '\n';
        bytes += Buffer.byteLength(header);
        yield header;
        let after: string | undefined;

        do {
          await reportProgress();
          if (
            Date.now() - lastRequesterRefreshAt >=
            RECORD_EXPORT_REQUESTER_REFRESH_INTERVAL_MS
          ) {
            context.queryRunnerContext.authContext =
              await recordExportQueryWorkspaceService.resolveRequester(
                recordExport,
              );
            lastRequesterRefreshAt = Date.now();
          } else {
            await recordExportQueryWorkspaceService.assertCanExport(
              context.queryRunnerContext.authContext,
            );
          }
          const { results } = await recordExportQueryWorkspaceService.readPage({
            parameters: recordExport.parameters,
            context,
            after,
          });

          await assertConnected();
          for (const record of results.records) {
            const row = formatRecordExportRow({
              columns: context.columns,
              record,
            });
            bytes += Buffer.byteLength(row);
            if (bytes > RECORD_EXPORT_MAX_FILE_BYTES) {
              throw new RecordExportException(
                'Export file size limit exceeded',
                'FILE_SIZE_LIMIT_EXCEEDED',
                {
                  userFriendlyMessage: msg`The export file is too large. Please export fewer records.`,
                },
              );
            }
            yield row;
            processedRecordCount++;
          }

          if (
            Date.now() - lastProgressAt >=
            RECORD_EXPORT_PROGRESS_INTERVAL_MS
          ) {
            await reportProgress();
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

      const resource = this.recordExportWorkspaceService.getFileResource({
        workspaceId,
        resourcePath: filePath,
      });
      const file = await this.fileStorageService.createPendingFile({
        ...resource,
        fileId,
        size: 0,
        mimeType: 'application/octet-stream',
        settings: { isTemporaryFile: true, toDelete: false },
      });

      stream = Readable.from(generateCsv(), { signal });
      await this.fileStorageService.writeFileStream({
        ...resource,
        stream,
        mimeType: 'text/csv',
      });

      await this.fileRepository.update(
        workspaceId,
        { id: file.id },
        { status: FILE_STATUS.UPLOADED, size: bytes, mimeType: 'text/csv' },
      );

      await assertConnected();
      return { fileId, processedRecordCount, totalRecordCount };
    } catch (error) {
      stream?.destroy();
      await this.fileStorageService
        .deleteFile(
          this.recordExportWorkspaceService.getFileResource({
            workspaceId,
            resourcePath: filePath,
          }),
        )
        .catch(() =>
          this.logger.warn(
            `Failed to remove partial export ${recordExport.id}`,
          ),
        );
      await updateProgress({
        processedRecordCount,
        totalRecordCount,
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
}
