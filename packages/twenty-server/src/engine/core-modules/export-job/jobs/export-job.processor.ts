import { Logger, Scope } from '@nestjs/common';
import { In } from 'typeorm';

import { FileFolder } from 'twenty-shared/types';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  ExportJobService,
  EXPORT_JOB_PROCESSOR_NAME,
  type ExportJobData,
} from 'src/engine/core-modules/export-job/export-job.service';
import { ExportJobStatus } from 'src/engine/core-modules/export-job/enums/export-job-status.enum';
import { generateCSVFromRecords } from 'src/engine/core-modules/export-job/utils/process-records-for-csv.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const BATCH_SIZE = 500;
const RELATION_BATCH_SIZE = 200;

type RelationConfig = {
  relationFieldName: string;
  relationFieldLabel: string;
  targetObjectNameSingular: string;
  selectedFieldPaths: string[];
};

type ExportColumn = {
  fieldName: string;
  label: string;
  type: string;
};

@Processor({ queueName: MessageQueue.exportQueue, scope: Scope.REQUEST })
export class ExportJobProcessor {
  private readonly logger = new Logger(ExportJobProcessor.name);

  constructor(
    private readonly exportJobService: ExportJobService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Process(EXPORT_JOB_PROCESSOR_NAME)
  async handle(data: ExportJobData): Promise<void> {
    const { exportJobId, workspaceId } = data;

    this.logger.log(`Starting export job ${exportJobId}`);

    const exportJob = await this.exportJobService.getExportJob(
      exportJobId,
      workspaceId,
    );

    if (!exportJob) {
      this.logger.error(`Export job ${exportJobId} not found`);

      return;
    }

    if (exportJob.status === ExportJobStatus.CANCELLED) {
      this.logger.log(`Export job ${exportJobId} was cancelled before start`);

      return;
    }

    await this.exportJobService.updateProgress(exportJobId, {
      status: ExportJobStatus.PROCESSING,
    });

    const columns = exportJob.columns as ExportColumn[];
    const relationConfigs = (exportJob.relationConfigs ?? []) as RelationConfig[];

    try {
      const authContext = buildSystemAuthContext(workspaceId);
      let allRecords: Record<string, unknown>[] = [];

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              exportJob.objectNameSingular,
              { shouldBypassPermissionChecks: true },
            );

          // Get workspace metadata for filter parsing
          const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
            await this.workspaceCacheService.getOrRecompute(workspaceId, [
              'flatObjectMetadataMaps',
              'flatFieldMetadataMaps',
            ]);

          const flatObjectMetadata = Object.values(
            flatObjectMetadataMaps.byUniversalIdentifier,
          ).find((m) => m?.nameSingular === exportJob.objectNameSingular);

          // Build a base query builder with filter applied
          const buildFilteredQb = () => {
            const qb = repository.createQueryBuilder(
              exportJob.objectNameSingular,
            );

            if (exportJob.filter && flatObjectMetadata) {
              const parser = new GraphqlQueryParser(
                flatObjectMetadata,
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
              );

              parser.applyFilterToBuilder(
                qb,
                exportJob.objectNameSingular,
                exportJob.filter as any,
              );
            }

            return qb;
          };

          // Count total records
          const totalRecords = await buildFilteredQb().getCount();

          await this.exportJobService.updateProgress(exportJobId, {
            totalRecords,
          });

          // Fetch records in batches
          let offset = 0;

          while (offset < totalRecords) {
            const currentJob = await this.exportJobService.getExportJob(
              exportJobId,
              workspaceId,
            );

            if (currentJob?.status === ExportJobStatus.CANCELLED) {
              this.logger.log(
                `Export job ${exportJobId} cancelled at offset ${offset}`,
              );
              break;
            }

            const qb = buildFilteredQb();

            qb.orderBy(
              `"${exportJob.objectNameSingular}"."createdAt"`,
              'DESC',
            );
            qb.skip(offset);
            qb.take(BATCH_SIZE);

            const batch = await qb.getMany();

            allRecords.push(...(batch as Record<string, unknown>[]));
            offset += BATCH_SIZE;

            await this.exportJobService.updateProgress(exportJobId, {
              processedRecords: Math.min(offset, totalRecords),
            });
          }

          // Fetch relation data if configured
          if (relationConfigs.length > 0 && allRecords.length > 0) {
            allRecords = await this.expandRelationFields(
              allRecords,
              columns,
              relationConfigs,
              workspaceId,
            );
          }
        },
        authContext,
      );

      // Check if cancelled during fetch
      const finalCheck = await this.exportJobService.getExportJob(
        exportJobId,
        workspaceId,
      );

      if (finalCheck?.status === ExportJobStatus.CANCELLED) {
        this.logger.log(`Export job ${exportJobId} cancelled`);

        return;
      }

      if (allRecords.length === 0) {
        await this.exportJobService.updateProgress(exportJobId, {
          status: ExportJobStatus.COMPLETED,
          totalRecords: 0,
          processedRecords: 0,
          result: { error: 'No records to export' },
        });

        return;
      }

      // Build final columns (expand relation columns)
      const finalColumns = this.buildFinalColumns(columns, relationConfigs);

      // Generate CSV
      const csvContent = generateCSVFromRecords(allRecords, finalColumns);

      // Store in file storage
      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        );

      const resourcePath = `exports/${exportJobId}.csv`;

      const savedFile = await this.fileStorageService.writeFile({
        sourceFile: Buffer.from(csvContent, 'utf-8'),
        mimeType: 'text/csv',
        fileFolder: FileFolder.Export,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceId,
        resourcePath,
        settings: { isTemporaryFile: true, toDelete: false },
      });

      // Generate signed download URL
      const downloadUrl = this.fileUrlService.signFileByIdUrl({
        fileId: savedFile.id,
        workspaceId,
        fileFolder: FileFolder.Export,
      });

      await this.exportJobService.updateProgress(exportJobId, {
        status: ExportJobStatus.COMPLETED,
        processedRecords: allRecords.length,
        result: {
          fileId: savedFile.id,
          downloadUrl,
          recordCount: allRecords.length,
        },
      });

      this.logger.log(
        `Export job ${exportJobId} completed: ${allRecords.length} records exported`,
      );
    } catch (error) {
      this.logger.error(
        `Export job ${exportJobId} failed unexpectedly: ${error}`,
      );

      await this.exportJobService.updateProgress(exportJobId, {
        status: ExportJobStatus.FAILED,
        result: {
          error:
            error instanceof Error ? error.message : 'Unexpected error',
        },
      });
    }
  }

  /**
   * Fetch related records and flatten their fields onto the main records.
   *
   * For each relation config:
   * 1. Collect unique foreign key IDs from the main records
   * 2. Batch-fetch related records from the target object's table
   * 3. For each main record, look up the related record and flatten
   *    selected sub-fields as `relationFieldName__subFieldPath`
   */
  private async expandRelationFields(
    records: Record<string, unknown>[],
    columns: ExportColumn[],
    relationConfigs: RelationConfig[],
    workspaceId: string,
  ): Promise<Record<string, unknown>[]> {
    // Build lookup maps per relation
    const relationLookups = new Map<
      string,
      { joinColumnName: string; lookupMap: Map<string, Record<string, unknown>> }
    >();

    for (const rc of relationConfigs) {
      // The join column is conventionally `{relationFieldName}Id`
      const joinColumnName = `${rc.relationFieldName}Id`;

      // Collect unique related IDs
      const relatedIds = [
        ...new Set(
          records
            .map((r) => r[joinColumnName] as string | undefined)
            .filter((id): id is string => typeof id === 'string' && id.length > 0),
        ),
      ];

      if (relatedIds.length === 0) {
        relationLookups.set(rc.relationFieldName, {
          joinColumnName,
          lookupMap: new Map(),
        });
        continue;
      }

      const lookupMap = new Map<string, Record<string, unknown>>();

      try {
        const relatedRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            rc.targetObjectNameSingular,
            { shouldBypassPermissionChecks: true },
          );

        // Fetch in batches
        for (let i = 0; i < relatedIds.length; i += RELATION_BATCH_SIZE) {
          const batchIds = relatedIds.slice(i, i + RELATION_BATCH_SIZE);

          const relatedRecords = await relatedRepository.find({
            where: { id: In(batchIds) } as any,
          });

          for (const related of relatedRecords as Record<string, unknown>[]) {
            if (typeof related.id === 'string') {
              lookupMap.set(related.id, related);
            }
          }
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch related ${rc.targetObjectNameSingular} records: ${error}`,
        );
      }

      relationLookups.set(rc.relationFieldName, { joinColumnName, lookupMap });
    }

    // Flatten relation fields onto each record
    return records.map((record) => {
      const expanded = { ...record };

      for (const rc of relationConfigs) {
        const lookup = relationLookups.get(rc.relationFieldName);

        if (!lookup) continue;

        const relatedId = record[lookup.joinColumnName] as string | undefined;
        const relatedRecord =
          relatedId ? lookup.lookupMap.get(relatedId) : undefined;

        // Always include 'id' for the related record
        const selectedPaths = rc.selectedFieldPaths.includes('id')
          ? rc.selectedFieldPaths
          : ['id', ...rc.selectedFieldPaths];

        for (const fieldPath of selectedPaths) {
          const flatKey = `${rc.relationFieldName}__${fieldPath}`;
          const rawValue = relatedRecord
            ? this.getNestedValue(relatedRecord, fieldPath)
            : '';

          if (rawValue !== null && typeof rawValue === 'object') {
            // Composite field — flatten sub-keys
            const obj = rawValue as Record<string, unknown>;

            for (const [subKey, subValue] of Object.entries(obj)) {
              if (subKey === '__typename') continue;
              expanded[`${flatKey}__${subKey}`] = subValue ?? '';
            }
          } else {
            expanded[flatKey] = rawValue ?? '';
          }
        }
      }

      return expanded;
    });
  }

  /**
   * Build final column definitions including expanded relation columns.
   */
  private buildFinalColumns(
    columns: ExportColumn[],
    relationConfigs: RelationConfig[],
  ): ExportColumn[] {
    if (relationConfigs.length === 0) {
      return columns;
    }

    const relationFieldNames = new Set(
      relationConfigs.map((rc) => rc.relationFieldName),
    );

    const finalColumns: ExportColumn[] = [];

    for (const col of columns) {
      // If this column is a configured relation, replace with expanded sub-columns
      if (relationFieldNames.has(col.fieldName)) {
        const rc = relationConfigs.find(
          (r) => r.relationFieldName === col.fieldName,
        );

        if (!rc) {
          finalColumns.push(col);
          continue;
        }

        const selectedPaths = rc.selectedFieldPaths.includes('id')
          ? rc.selectedFieldPaths
          : ['id', ...rc.selectedFieldPaths];

        for (const fieldPath of selectedPaths) {
          finalColumns.push({
            fieldName: `${rc.relationFieldName}__${fieldPath}`,
            label: `${rc.relationFieldLabel} / ${fieldPath}`,
            type: 'TEXT',
          });
        }
      } else {
        finalColumns.push(col);
      }
    }

    return finalColumns;
  }

  /**
   * Get a possibly nested value from a record (e.g., "name.firstName").
   */
  private getNestedValue(
    record: Record<string, unknown>,
    path: string,
  ): unknown {
    const parts = path.split('.');
    let current: unknown = record;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}
