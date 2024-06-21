// Take all metadata migrations
// Add required constraint comments for each of them
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';
import chalk from 'chalk';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { capitalize } from 'src/utils/capitalize';

interface AddGraphqlConstraintsCommentsCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.0.21:add-graphql-constraints-comments-command',
  description: 'Add required comments on foreign key constraints',
})
export class AddGraphqlConstraintsCommentsCommand extends CommandRunner {
  private readonly logger = new Logger(
    AddGraphqlConstraintsCommentsCommand.name,
  );
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: AddGraphqlConstraintsCommentsCommandOptions,
  ): Promise<void> {
    let workspaceIds: string[];

    if (options.workspaceId) {
      workspaceIds = [options.workspaceId];
    } else {
      workspaceIds = (await this.workspaceRepository.find()).map(
        (workspace) => workspace.id,
      );
    }

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    } else {
      this.logger.log(
        chalk.green(`Running command on ${workspaceIds.length} workspaces`),
      );
    }

    for (const workspaceId of workspaceIds) {
      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );

      const dataSourceMetadatas =
        await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
          workspaceId,
        );
      const isForeignKeyCommentConstraintEnabled =
        await this.featureFlagRepository.findOneBy({
          workspaceId,
          key: FeatureFlagKeys.IsForeignKeyCommentConstraintEnabled,
          value: true,
        });

      if (!isForeignKeyCommentConstraintEnabled) {
        this.logger.log(
          chalk.yellow(
            `No active IsForeignKeyCommentConstraintEnabled feature flag for workspace ${workspaceId}. Skipping...`,
          ),
        );
        continue;
      }

      for (const dataSourceMetadata of dataSourceMetadatas) {
        const workspaceDataSource =
          await this.typeORMService.connectToDataSource(dataSourceMetadata);

        if (workspaceDataSource) {
          const queryRunner = workspaceDataSource.createQueryRunner();

          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            const schemaName =
              this.workspaceDataSourceService.getSchemaName(workspaceId);

            const appliedMigrations =
              await this.workspaceMigrationService.getAppliedMigrations(
                workspaceId,
              );

            const flattenedAppliedMigrations: WorkspaceMigrationTableAction[] =
              appliedMigrations.reduce((acc, pendingMigration) => {
                return [...acc, ...pendingMigration.migrations];
              }, []);

            for (const migration of flattenedAppliedMigrations) {
              if (
                migration.action === WorkspaceMigrationTableActionType.ALTER &&
                migration.columns &&
                migration.columns.length > 0
              ) {
                for (const migrationColumn of migration.columns) {
                  if (
                    migrationColumn.action ===
                    WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY
                  ) {
                    const tableName = migration.newName ?? migration.name;

                    const existingForeignKeys = await queryRunner.query(`
                    SELECT
                        conname AS constraint_name,
                        conrelid::regclass AS table_from,
                            a1.attname AS column_from,
                        confrelid::regclass AS table_to,
                            a2.attname AS column_to
                    FROM
                        pg_constraint AS con
                            JOIN pg_class AS tbl_from ON con.conrelid = tbl_from.oid
                            JOIN pg_class AS tbl_to ON con.confrelid = tbl_to.oid
                            JOIN pg_attribute AS a1 ON a1.attnum = ANY(con.conkey) AND a1.attrelid = tbl_from.oid
                            JOIN pg_attribute AS a2 ON a2.attnum = ANY(con.confkey) AND a2.attrelid = tbl_to.oid
                    WHERE
                        con.contype = 'f'
                      AND tbl_from.relname = '${tableName}'
                      AND a1.attname = '${migrationColumn.columnName}'
                      AND tbl_to.relname = '${migrationColumn.referencedTableName}'
                      AND a2.attname = '${migrationColumn.referencedTableColumnName}'
                    `);

                    if (existingForeignKeys.length) {
                      const foreignKeyName =
                        existingForeignKeys?.[0].constraint_name;

                      console.log('--------------');
                      console.log(existingForeignKeys);
                      console.log(migration);

                      if (foreignKeyName) {
                        await queryRunner.query(`
                          COMMENT ON CONSTRAINT "${foreignKeyName}" ON "${schemaName}"."${tableName}" IS e'@graphql({"foreign_name": "${
                            migrationColumn.referencedTableName
                          }", "local_name": "${capitalize(
                            migrationColumn.referencedTableName,
                          )}"})';
                        `);
                      }
                    }
                  }
                }
              }
            }

            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.log(
              chalk.red(`Running command on workspace ${workspaceId} failed`),
            );
            throw error;
          } finally {
            await queryRunner.release();
          }
        }
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
