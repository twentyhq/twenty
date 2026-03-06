import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

interface MismatchedField {
  fieldId: string;
  currentFieldName: string;
  expectedFieldName: string;
  sourceObjectName: string;
  targetObjectNameSingular: string;
  currentJoinColumnName: string;
  expectedJoinColumnName: string;
  workspaceSchema: string;
}

@Command({
  name: 'upgrade:1-17:fix-morph-relation-field-names',
  description:
    'Fix morph relation field names that do not match their target object names',
})
export class FixMorphRelationFieldNamesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Checking morph relation field names for workspace ${workspaceId}`,
    );

    const mismatchedFields = await this.findMismatchedFields(workspaceId);

    if (mismatchedFields.length === 0) {
      this.logger.log(
        `✅ No mismatched fields found for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${mismatchedFields.length} mismatched field(s) in workspace ${workspaceId}:`,
    );

    for (const field of mismatchedFields) {
      this.logger.log(
        `  - ${field.sourceObjectName}.${field.currentFieldName} → ${field.expectedFieldName} (target: ${field.targetObjectNameSingular})`,
      );
    }

    if (dryRun) {
      this.logger.log('[DRY RUN] No changes made');
      this.logger.log(
        '⚠️  Before running without --dry-run, please ensure you have a database backup',
      );

      return;
    }

    this.logger.log(
      '⚠️  Starting fix. Ensure you have a database backup before proceeding.',
    );

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let fixedCount = 0;

      for (const field of mismatchedFields) {
        // Step 1: Attempt to rename the column, handling failures gracefully
        if (field.currentJoinColumnName !== field.expectedJoinColumnName) {
          // Use a savepoint so a failed rename doesn't abort the whole transaction
          const renameColumnSavepoint = 'rename_column';

          await queryRunner.query(`SAVEPOINT ${renameColumnSavepoint}`);
          try {
            await queryRunner.query(
              `ALTER TABLE "${field.workspaceSchema}"."${field.sourceObjectName}"
               RENAME COLUMN "${field.currentJoinColumnName}" TO "${field.expectedJoinColumnName}"`,
            );
            await queryRunner.query(
              `RELEASE SAVEPOINT ${renameColumnSavepoint}`,
            );
            this.logger.log(
              `Renamed column ${field.currentJoinColumnName} → ${field.expectedJoinColumnName} in ${field.workspaceSchema}.${field.sourceObjectName}`,
            );
          } catch (error) {
            await queryRunner.query(
              `ROLLBACK TO SAVEPOINT ${renameColumnSavepoint}`,
            );
            await queryRunner.query(
              `RELEASE SAVEPOINT ${renameColumnSavepoint}`,
            );
            const errorCode = this.getPostgresErrorCode(error);

            if (errorCode === '42701') {
              this.logger.warn(
                `⚠️  SKIPPING ${field.sourceObjectName}.${field.currentFieldName}: Both columns exist (${field.currentJoinColumnName} and ${field.expectedJoinColumnName}). Manual intervention required.`,
              );
              continue;
            }
            if (errorCode !== '42703') {
              throw error;
            }
            this.logger.log(
              `Column rename skipped for ${field.sourceObjectName}.${field.currentJoinColumnName} (column may already be renamed or missing), updating metadata only`,
            );
          }
        }

        // Step 2: Verify field still exists with expected current name before updating
        const fieldCheck = await queryRunner.query(
          `SELECT id, name FROM core."fieldMetadata" WHERE id = $1`,
          [field.fieldId],
        );

        if (fieldCheck.length === 0) {
          this.logger.warn(
            `⚠️  Field ${field.fieldId} no longer exists, skipping`,
          );
          continue;
        }

        if (fieldCheck[0].name !== field.currentFieldName) {
          this.logger.warn(
            `⚠️  Field ${field.fieldId} name changed from ${field.currentFieldName} to ${fieldCheck[0].name} since query, skipping`,
          );
          continue;
        }

        // Step 3: Update field metadata
        const newSettings = {
          joinColumnName: field.expectedJoinColumnName,
        };

        const updateResult = await queryRunner.query(
          `UPDATE core."fieldMetadata"
           SET name = $1,
               settings = settings || $2::jsonb
           WHERE id = $3
             AND name = $4
           RETURNING id`,
          [
            field.expectedFieldName,
            JSON.stringify(newSettings),
            field.fieldId,
            field.currentFieldName,
          ],
        );

        if (updateResult.length > 0) {
          this.logger.log(
            `✓ Updated fieldMetadata: ${field.currentFieldName} → ${field.expectedFieldName}`,
          );
          fixedCount++;
        } else {
          this.logger.log(
            `Field metadata already up to date for ${field.currentFieldName}`,
          );
        }
      }

      await queryRunner.commitTransaction();

      if (fixedCount > 0) {
        // Invalidate flat entity caches (new cache system)
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatFieldMetadataMaps',
          'ORMEntityMetadatas',
          'rolesPermissions',
          'userWorkspaceRoleMap',
          'flatRoleTargetMaps',
          'apiKeyRoleMap',
          'flatRoleTargetByAgentIdMaps',
        ]);

        // Increment metadata version so GraphQL schema is regenerated
        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );

        // Flush legacy cache (GraphQL typeDefs, ORM entity schemas, GraphQL operations)
        await this.workspaceCacheStorageService.flush(workspaceId);

        this.logger.log(`Cache invalidated and metadata version incremented`);
      }

      this.logger.log(
        `✅ Successfully fixed ${fixedCount} field(s) in workspace ${workspaceId}`,
      );
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error fixing morph relation field names (rolled transaction back on ${workspaceId})`,
          error,
        );
      } else {
        this.logger.error(
          `Error fixing morph relation field names after commit on ${workspaceId}`,
          error,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findMismatchedFields(
    workspaceId: string,
  ): Promise<MismatchedField[]> {
    // Only process fields on these specific objects that use the target morph pattern
    const allowedSourceObjects = [
      'noteTarget',
      'taskTarget',
      'attachment',
      'timelineActivity',
    ];

    const result = await this.coreDataSource.query(
      `SELECT
        fm.id AS "fieldId",
        fm.name AS "currentFieldName",
        fm.settings->>'joinColumnName' AS "currentJoinColumnName",
        source_om."nameSingular" AS "sourceObjectName",
        target_om."nameSingular" AS "targetObjectNameSingular",
        ds.schema AS "workspaceSchema"
      FROM core."fieldMetadata" fm
      JOIN core."objectMetadata" source_om ON fm."objectMetadataId" = source_om.id
      JOIN core."objectMetadata" target_om ON fm."relationTargetObjectMetadataId" = target_om.id
      JOIN core."dataSource" ds ON ds."workspaceId" = fm."workspaceId"
      WHERE fm."workspaceId" = $1
        AND fm.type = $2
        AND fm.name LIKE 'target%'
        AND source_om."nameSingular" = ANY($3)`,
      [workspaceId, FieldMetadataType.MORPH_RELATION, allowedSourceObjects],
    );

    // Filter in JavaScript to handle camelCase properly
    return result
      .filter(
        (row: {
          currentFieldName: string;
          targetObjectNameSingular: string;
        }) => {
          const expectedFieldName = `target${capitalize(row.targetObjectNameSingular)}`;

          return row.currentFieldName !== expectedFieldName;
        },
      )
      .map(
        (row: {
          fieldId: string;
          currentFieldName: string;
          currentJoinColumnName: string | null;
          sourceObjectName: string;
          targetObjectNameSingular: string;
          workspaceSchema: string;
        }) => {
          const expectedFieldName = `target${capitalize(row.targetObjectNameSingular)}`;
          const expectedJoinColumnName =
            computeMorphOrRelationFieldJoinColumnName({
              name: expectedFieldName,
            });

          // Fallback: if settings.joinColumnName is null, derive from field name
          const currentJoinColumnName =
            row.currentJoinColumnName ??
            computeMorphOrRelationFieldJoinColumnName({
              name: row.currentFieldName,
            });

          return {
            fieldId: row.fieldId,
            currentFieldName: row.currentFieldName,
            expectedFieldName,
            sourceObjectName: row.sourceObjectName,
            targetObjectNameSingular: row.targetObjectNameSingular,
            currentJoinColumnName,
            expectedJoinColumnName,
            workspaceSchema: row.workspaceSchema,
          };
        },
      );
  }

  private getPostgresErrorCode(error: unknown): string | null {
    if (!(error instanceof QueryFailedError)) {
      return null;
    }
    const driverError: unknown = error.driverError;

    if (
      typeof driverError === 'object' &&
      driverError !== null &&
      'code' in driverError
    ) {
      const code = (driverError as { code?: unknown }).code;

      return typeof code === 'string' ? code : null;
    }

    return null;
  }
}
