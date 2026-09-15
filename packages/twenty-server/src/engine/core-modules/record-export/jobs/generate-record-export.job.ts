import { Logger } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { Readable } from 'stream';
import {
  formatValueForCSV,
  isDefined,
  sanitizeValueForCSVExport,
} from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_MAX_FILE_BYTES,
  RECORD_EXPORT_PROGRESS_INTERVAL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { formatRecordExportRow } from 'src/engine/core-modules/record-export/utils/format-record-export-row.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type GenerateRecordExportJobData = {
  workspaceId: string;
  recordExportId: string;
};

@Processor(MessageQueue.recordExportQueue)
export class GenerateRecordExportJob {
  private readonly logger = new Logger(GenerateRecordExportJob.name);

  constructor(
    @InjectWorkspaceScopedRepository(RecordExportEntity)
    private readonly recordExportRepository: WorkspaceScopedRepository<RecordExportEntity>,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Process(GenerateRecordExportJob.name)
  async handle({
    workspaceId,
    recordExportId,
  }: GenerateRecordExportJobData): Promise<void> {
    const recordExport = await this.recordExportWorkspaceService.findOrThrow(
      workspaceId,
      recordExportId,
    );
    const attemptId = v4();
    const filePath = `${recordExport.id}/${attemptId}.csv`;
    const claim = await this.recordExportRepository.update(
      workspaceId,
      {
        id: recordExport.id,
        status: In([RecordExportStatus.QUEUED, RecordExportStatus.PROCESSING]),
      },
      {
        attemptId,
        status: RecordExportStatus.PROCESSING,
        processedRecordCount: 0,
        errorMessage: null,
      },
    );

    if (!claim.affected) return;

    let processedRecordCount = 0;
    let stream: Readable | undefined;

    try {
      const remainingTime =
        RECORD_EXPORT_MAX_DURATION_MS -
        (Date.now() - recordExport.createdAt.getTime());
      if (remainingTime <= 0)
        throw new Error(
          t`The export took too long. Please try exporting fewer records.`,
        );

      const requester =
        await this.recordExportQueryWorkspaceService.resolveRequester(
          recordExport,
        );
      const context = await this.recordExportQueryWorkspaceService.buildContext(
        recordExport.parameters,
        requester,
      );
      const recordExportQueryWorkspaceService =
        this.recordExportQueryWorkspaceService;
      const recordExportRepository = this.recordExportRepository;
      const recordExportWorkspaceService = this.recordExportWorkspaceService;
      let lastProgressAt = 0;
      let bytes = 0;

      const updateProgress = async () => {
        const result = await recordExportRepository.update(
          workspaceId,
          {
            id: recordExport.id,
            attemptId,
            status: RecordExportStatus.PROCESSING,
          },
          { processedRecordCount },
        );
        if (!result.affected) throw new Error('Export attempt was superseded');
        await recordExportWorkspaceService.publish(
          await recordExportWorkspaceService.findOrThrow(
            workspaceId,
            recordExport.id,
          ),
        );
        lastProgressAt = Date.now();
      };

      await updateProgress();

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
          context.queryRunnerContext.authContext =
            await recordExportQueryWorkspaceService.resolveRequester(
              recordExport,
            );
          const { results } = await recordExportQueryWorkspaceService.readPage(
            recordExport.parameters,
            context,
            after,
          );

          for (const record of results.records) {
            const row = formatRecordExportRow(context.columns, record);
            bytes += Buffer.byteLength(row);
            if (bytes > RECORD_EXPORT_MAX_FILE_BYTES)
              throw new Error(
                t`The export file is too large. Please export fewer records.`,
              );
            yield row;
            processedRecordCount++;
          }

          if (Date.now() - lastProgressAt >= RECORD_EXPORT_PROGRESS_INTERVAL_MS)
            await updateProgress();
          if (!results.pageInfo.hasNextPage) break;

          const endCursor = results.pageInfo.endCursor;
          if (!isDefined(endCursor) || endCursor === after)
            throw new Error('Export pagination did not advance');
          after = endCursor;
        } while (true);
      }

      stream = Readable.from(generateCsv(), {
        signal: AbortSignal.timeout(remainingTime),
      });
      await this.fileStorageService.writeFileStream({
        ...this.recordExportWorkspaceService.getFileResource(
          workspaceId,
          filePath,
        ),
        stream,
        mimeType: 'text/csv',
      });

      const completed = await this.recordExportRepository.update(
        workspaceId,
        {
          id: recordExport.id,
          attemptId,
          status: RecordExportStatus.PROCESSING,
        },
        {
          status: RecordExportStatus.COMPLETED,
          processedRecordCount,
          filePath,
        },
      );

      if (!completed.affected) throw new Error('Export attempt was superseded');

      await this.recordExportWorkspaceService.publish(
        await this.recordExportWorkspaceService.findOrThrow(
          workspaceId,
          recordExport.id,
        ),
      );
    } catch (error) {
      stream?.destroy();
      await this.fileStorageService
        .deleteFileObject(
          this.recordExportWorkspaceService.getFileResource(
            workspaceId,
            filePath,
          ),
        )
        .catch(() =>
          this.logger.warn(
            `Failed to remove partial export ${recordExport.id}`,
          ),
        );
      const failed = await this.recordExportRepository.update(
        workspaceId,
        {
          id: recordExport.id,
          attemptId,
          status: RecordExportStatus.PROCESSING,
        },
        {
          status: RecordExportStatus.FAILED,
          errorMessage: t`The export failed. Please try again or export fewer records.`,
        },
      );
      if (failed.affected)
        await this.recordExportWorkspaceService.publish(
          await this.recordExportWorkspaceService.findOrThrow(
            workspaceId,
            recordExport.id,
          ),
        );
      throw error;
    }
  }
}
