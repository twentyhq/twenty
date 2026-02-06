import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/providers/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache-storage/workspace-cache.service';

interface FixMorphRelationFieldNamesCommandOptions {
  workspaceId?: string;
  dryRun?: boolean;
}

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
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'Run on a specific workspace',
  })
  parseWorkspaceId(val: string): string {
    return val;
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Run in dry-run mode (no changes will be made)',
  })
  parseDryRun(): boolean {
    return true;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs<FixMorphRelationFieldNamesCommandOptions>): Promise<void> {
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

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const field of mismatchedFields) {
        // Step 1: Rename column in workspace schema
        const columnExists = await this.columnExists(
          queryRunner,
          field.workspaceSchema,
          field.sourceObjectName,
          field.currentJoinColumnName,
        );

        if (columnExists) {
          const targetColumnExists = await this.columnExists(
            queryRunner,
            field.workspaceSchema,
            field.sourceObjectName,
            field.expectedJoinColumnName,
          );

          if (targetColumnExists) {
            this.logger.log(
              `Column ${field.expectedJoinColumnName} already exists in ${field.workspaceSchema}.${field.sourceObjectName}, skipping column rename`,
            );
          } else {
            await queryRunner.query(
              `ALTER TABLE "${field.workspaceSchema}"."${field.sourceObjectName}" 
               RENAME COLUMN "${field.currentJoinColumnName}" TO "${field.expectedJoinColumnName}"`,
            );
            this.logger.log(
              `Renamed column ${field.currentJoinColumnName} → ${field.expectedJoinColumnName} in ${field.workspaceSchema}.${field.sourceObjectName}`,
            );
          }
        } else {
          this.logger.log(
            `Column ${field.currentJoinColumnName} does not exist in ${field.workspaceSchema}.${field.sourceObjectName}, skipping column rename`,
          );
        }

        // Step 2: Update field metadata
        const newSettings = {
          joinColumnName: field.expectedJoinColumnName,
        };

        await queryRunner.query(
          `UPDATE core."fieldMetadata"
           SET name = $1, 
               settings = settings || $2::jsonb
           WHERE id = $3
             AND name != $1`,
          [field.expectedFieldName, JSON.stringify(newSettings), field.fieldId],
        );

        this.logger.log(
          `Updated fieldMetadata: ${field.currentFieldName} → ${field.expectedFieldName}`,
        );
      }

      await queryRunner.commitTransaction();

      // Invalidate cache
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

      this.logger.log(
        `✅ Successfully fixed ${mismatchedFields.length} field(s) in workspace ${workspaceId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error fixing morph relation field names for workspace ${workspaceId}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findMismatchedFields(
    workspaceId: string,
  ): Promise<MismatchedField[]> {
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
        AND fm.name LIKE 'target%'`,
      [workspaceId, FieldMetadataType.MORPH_RELATION],
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
          currentJoinColumnName: string;
          sourceObjectName: string;
          targetObjectNameSingular: string;
          workspaceSchema: string;
        }) => {
          const expectedFieldName = `target${capitalize(row.targetObjectNameSingular)}`;
          const expectedJoinColumnName =
            computeMorphOrRelationFieldJoinColumnName({
              name: expectedFieldName,
            });

          return {
            fieldId: row.fieldId,
            currentFieldName: row.currentFieldName,
            expectedFieldName,
            sourceObjectName: row.sourceObjectName,
            targetObjectNameSingular: row.targetObjectNameSingular,
            currentJoinColumnName: row.currentJoinColumnName,
            expectedJoinColumnName,
            workspaceSchema: row.workspaceSchema,
          };
        },
      );
  }

  private async columnExists(
    queryRunner: import('typeorm').QueryRunner,
    schema: string,
    table: string,
    column: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = $1 
          AND table_name = $2 
          AND column_name = $3
      ) AS exists`,
      [schema, table, column],
    );

    return result[0]?.exists ?? false;
  }
}
