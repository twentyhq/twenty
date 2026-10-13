import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Readable } from 'stream';
import {
  formatValueForCSV,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECORD_EXPORT_MAX_FILE_BYTES } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { formatRecordExportRow } from 'src/engine/core-modules/record-export/utils/format-record-export-row.util';
import { TrackedJobRunnerWorkspaceService } from 'src/engine/core-modules/tracked-job/services/tracked-job-runner.workspace-service';
import { type TrackedJobPage } from 'src/engine/core-modules/tracked-job/types/tracked-job-page.type';
import { type TrackedJobRun } from 'src/engine/core-modules/tracked-job/types/tracked-job-run.type';
import { type TrackedJobProgress } from 'src/engine/core-modules/tracked-job/types/tracked-job-progress.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type RecordExportFile = { size: number };

@Processor(MessageQueue.recordExportQueue)
export class GenerateRecordExportJob {
  private readonly logger = new Logger(GenerateRecordExportJob.name);

  constructor(
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly trackedJobRunnerWorkspaceService: TrackedJobRunnerWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  @Process(GenerateRecordExportJob.name)
  async handle(
    recordExport: RecordExport,
    context: MessageQueueJobProgressContext,
  ): Promise<void> {
    await this.trackedJobRunnerWorkspaceService
      .run(
        {
          trackedJob: recordExport,
          context,
          failedMessage: msg`The export failed. Please try again or export fewer records.`,
        },
        async ({ requester, signal, readPages, reportProgress }) => {
          const { columns, queryRunnerContext, selectedFields } =
            await this.recordExportWorkspaceService.buildContext({
              parameters: recordExport.parameters,
              authContext: requester,
            });
          const file: RecordExportFile = { size: 0 };
          const pages = readPages({
            queryRunnerContext,
            selectedFields,
            filter: recordExport.parameters.filter,
            orderBy: recordExport.parameters.orderBy,
          });

          await this.writeFile(
            recordExport,
            this.generateCsv({ columns, pages, file, reportProgress }),
            file,
            signal,
          );
        },
      )
      .catch(async (error) => {
        await this.fileStorageService
          .deleteFile(
            this.recordExportWorkspaceService.getFileResource(recordExport),
          )
          .catch(() =>
            this.logger.warn(
              `Failed to remove partial export ${recordExport.id}`,
            ),
          );
        throw error;
      });
  }

  private async writeFile(
    recordExport: RecordExport,
    csv: AsyncIterable<string>,
    file: RecordExportFile,
    signal: AbortSignal,
  ): Promise<void> {
    const resource =
      this.recordExportWorkspaceService.getFileResource(recordExport);
    const pendingFile = await this.fileStorageService.createPendingFile({
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
        { id: pendingFile.id },
        {
          status: FILE_STATUS.UPLOADED,
          size: file.size,
          mimeType: 'text/csv',
        },
      );
    } finally {
      stream.destroy();
    }
  }

  private async *generateCsv({
    columns,
    pages,
    file,
    reportProgress,
  }: {
    columns: RecordExportColumn[];
    pages: AsyncIterable<TrackedJobPage>;
    file: RecordExportFile;
    reportProgress: TrackedJobRun<TrackedJobProgress>['reportProgress'];
  }): AsyncGenerator<string> {
    const header =
      '\uFEFF' +
      columns
        .map((column) =>
          formatValueForCSV(sanitizeValueForCSVExport(column.label)),
        )
        .join(',') +
      '\n';
    file.size += Buffer.byteLength(header);
    yield header;

    for await (const { records, processedCount, totalCount } of pages) {
      for (const record of records) {
        const row = formatRecordExportRow({ columns, record });
        file.size += Buffer.byteLength(row);
        if (file.size > RECORD_EXPORT_MAX_FILE_BYTES) {
          throw new RecordExportException(
            'Export file size limit exceeded',
            'FILE_SIZE_LIMIT_EXCEEDED',
            {
              userFriendlyMessage: msg`The export file is too large. Please export fewer records.`,
            },
          );
        }
        yield row;
      }
      await reportProgress({ processedCount, totalCount });
    }
  }
}
