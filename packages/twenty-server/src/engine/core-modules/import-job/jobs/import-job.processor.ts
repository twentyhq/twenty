import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  ImportJobService,
  IMPORT_JOB_PROCESSOR_NAME,
  type ImportJobData,
} from 'src/engine/core-modules/import-job/import-job.service';
import { ImportJobStatus } from 'src/engine/core-modules/import-job/enums/import-job-status.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

const BATCH_SIZE = 200;

@Processor({ queueName: MessageQueue.importQueue, scope: Scope.REQUEST })
export class ImportJobProcessor {
  private readonly logger = new Logger(ImportJobProcessor.name);

  constructor(
    private readonly importJobService: ImportJobService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(IMPORT_JOB_PROCESSOR_NAME)
  async handle(data: ImportJobData): Promise<void> {
    const { importJobId, workspaceId } = data;

    this.logger.log(`Starting import job ${importJobId}`);

    const importJob = await this.importJobService.getImportJob(
      importJobId,
      workspaceId,
    );

    if (!importJob) {
      this.logger.error(`Import job ${importJobId} not found`);

      return;
    }

    if (importJob.status === ImportJobStatus.CANCELLED) {
      this.logger.log(`Import job ${importJobId} was cancelled before start`);

      return;
    }

    await this.importJobService.updateProgress(importJobId, {
      status: ImportJobStatus.PROCESSING,
    });

    const validatedRows = importJob.validatedRows ?? [];
    const totalRecords = validatedRows.length;
    let processedRecords = 0;
    let successCount = 0;
    let warningCount = 0;
    let failureCount = 0;
    const allWarnings: Record<string, unknown>[] = [];
    const allErrors: Record<string, unknown>[] = [];

    try {
      const authContext = buildSystemAuthContext(workspaceId);

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              importJob.objectNameSingular,
              { shouldBypassPermissionChecks: true },
            );

          const numberOfBatches = Math.ceil(totalRecords / BATCH_SIZE);

          for (
            let batchIndex = 0;
            batchIndex < numberOfBatches;
            batchIndex++
          ) {
            // Check for cancellation between batches
            const currentJob = await this.importJobService.getImportJob(
              importJobId,
              workspaceId,
            );

            if (currentJob?.status === ImportJobStatus.CANCELLED) {
              this.logger.log(
                `Import job ${importJobId} cancelled at batch ${batchIndex}`,
              );
              break;
            }

            const batchStart = batchIndex * BATCH_SIZE;
            const batchRows = validatedRows.slice(
              batchStart,
              batchStart + BATCH_SIZE,
            );

            try {
              // The validated rows are already in record input format.
              // Use upsert with 'id' as the conflict key so existing records
              // are updated and new records are inserted.
              await repository.upsert(batchRows, ['id']);

              successCount += batchRows.length;
            } catch (error: unknown) {
              // Check if this is a partial success (some records had connect warnings)
              const errorAny = error as any;

              if (errorAny?.code === 'IMPORT_PARTIAL_SUCCESS') {
                const savedCount = errorAny.savedRecordCount ?? batchRows.length;
                const warnings = errorAny.importWarnings ?? [];

                successCount += savedCount;
                warningCount += warnings.length;
                allWarnings.push(...warnings);
              } else {
                // Full batch failure
                failureCount += batchRows.length;
                allErrors.push({
                  batchIndex,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Unknown error',
                });
              }
            }

            processedRecords = Math.min(
              batchStart + batchRows.length,
              totalRecords,
            );

            // Publish progress every batch
            await this.importJobService.updateProgress(importJobId, {
              processedRecords,
              successCount,
              warningCount,
              failureCount,
            });
          }
        },
        authContext,
      );

      // Determine final status
      const finalJob = await this.importJobService.getImportJob(
        importJobId,
        workspaceId,
      );

      const finalStatus =
        finalJob?.status === ImportJobStatus.CANCELLED
          ? ImportJobStatus.CANCELLED
          : failureCount === totalRecords
            ? ImportJobStatus.FAILED
            : ImportJobStatus.COMPLETED;

      await this.importJobService.updateProgress(importJobId, {
        status: finalStatus,
        processedRecords,
        successCount,
        warningCount,
        failureCount,
        result: {
          warnings: allWarnings,
          errors: allErrors,
        },
      });

      this.logger.log(
        `Import job ${importJobId} ${finalStatus}: ${successCount} success, ${warningCount} warnings, ${failureCount} failures`,
      );
    } catch (error) {
      this.logger.error(
        `Import job ${importJobId} failed unexpectedly: ${error}`,
      );

      await this.importJobService.updateProgress(importJobId, {
        status: ImportJobStatus.FAILED,
        result: {
          warnings: allWarnings,
          errors: [
            ...allErrors,
            {
              error:
                error instanceof Error ? error.message : 'Unexpected error',
            },
          ],
        },
      });
    }
  }
}
