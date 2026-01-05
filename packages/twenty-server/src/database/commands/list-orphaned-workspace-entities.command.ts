import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import {
  MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

type DeletionResult = {
  entityName: string;
  success: boolean;
  deletedCount?: number;
  error?: string;
};

// All entities that extend WorkspaceRelatedEntity or SyncableEntity
const WORKSPACE_RELATED_ENTITIES: EntityTarget<ObjectLiteral>[] = [
  AgentEntity,
  CronTriggerEntity,
  DatabaseEventTriggerEntity,
  FieldMetadataEntity,
  IndexMetadataEntity,
  ObjectMetadataEntity,
  PageLayoutEntity,
  PageLayoutTabEntity,
  PageLayoutWidgetEntity,
  RoleEntity,
  RoleTargetEntity,
  RouteTriggerEntity,
  RowLevelPermissionPredicateEntity,
  RowLevelPermissionPredicateGroupEntity,
  ServerlessFunctionEntity,
  ViewEntity,
  ViewFieldEntity,
  ViewFilterEntity,
  ViewFilterGroupEntity,
  ViewGroupEntity,
  ViewSortEntity,
];

type OrphanedRecord = {
  entityName: string;
  id: string;
  workspaceId: string;
};

@Command({
  name: 'workspace:list-orphaned-entities',
  description:
    'List and optionally delete records from workspace-related entities that reference a workspaceId not present in the workspace table',
})
export class ListOrphanedWorkspaceEntitiesCommand extends MigrationCommandRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    this.logger.log(
      chalk.blue('Looking for orphaned records in workspace-related entities...'),
    );

    const allOrphanedRecords: OrphanedRecord[] = [];
    const orphanedIdsByEntity = new Map<EntityTarget<ObjectLiteral>, string[]>();

    for (const entity of WORKSPACE_RELATED_ENTITIES) {
      const entityName =
        typeof entity === 'function' ? entity.name : String(entity);

      const orphanedRecords = await this.dataSource
        .getRepository(entity)
        .createQueryBuilder('entity')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from(WorkspaceEntity, 'workspace')
            .where('workspace.id = entity.workspaceId')
            .getQuery();

          return `NOT EXISTS ${subQuery}`;
        })
        .getMany();

      if (orphanedRecords.length > 0) {
        const ids = orphanedRecords.map((record) => record.id as string);

        orphanedIdsByEntity.set(entity, ids);

        for (const record of orphanedRecords) {
          allOrphanedRecords.push({
            entityName,
            id: record.id as string,
            workspaceId: record.workspaceId as string,
          });
        }

        this.logger.log(
          chalk.yellow(
            `  ${entityName}: ${orphanedRecords.length} orphaned record(s)`,
          ),
        );
      }
    }

    if (allOrphanedRecords.length === 0) {
      this.logger.log(chalk.green('No orphaned records found.'));

      return;
    }

    this.logger.log(
      chalk.yellow(
        `\nTotal: ${allOrphanedRecords.length} orphaned record(s) across ${orphanedIdsByEntity.size} entity type(s)`,
      ),
    );

    const orphanedWorkspaceIds = [
      ...new Set(allOrphanedRecords.map((r) => r.workspaceId)),
    ];

    this.logger.log(
      chalk.yellow(
        `Orphaned workspace IDs (${orphanedWorkspaceIds.length}): ${orphanedWorkspaceIds.join(', ')}`,
      ),
    );

    for (const record of allOrphanedRecords) {
      this.logger.log(
        chalk.gray(
          `  - ${record.entityName}: ID=${record.id}, WorkspaceId=${record.workspaceId}`,
        ),
      );
    }

    if (options.dryRun) {
      this.logger.log(
        chalk.yellow(
          `\nDry run mode: ${allOrphanedRecords.length} record(s) would be deleted.`,
        ),
      );

      return;
    }

    this.logger.log(
      chalk.red(
        `\nDeleting ${allOrphanedRecords.length} orphaned record(s)...`,
      ),
    );

    const deletionResults: DeletionResult[] = [];

    for (const [entity, ids] of orphanedIdsByEntity) {
      const entityName =
        typeof entity === 'function' ? entity.name : String(entity);

      try {
        const result = await this.dataSource
          .getRepository(entity)
          .createQueryBuilder()
          .delete()
          .from(entity)
          .whereInIds(ids)
          .execute();

        deletionResults.push({
          entityName,
          success: true,
          deletedCount: result.affected || 0,
        });

        this.logger.log(
          chalk.green(`  ✓ Deleted ${result.affected || 0} ${entityName} record(s)`),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        deletionResults.push({
          entityName,
          success: false,
          error: errorMessage,
        });

        this.logger.error(
          chalk.red(`  ✗ Failed to delete ${entityName} records: ${errorMessage}`),
        );
      }
    }

    const successfulDeletions = deletionResults.filter((r) => r.success);
    const failedDeletions = deletionResults.filter((r) => !r.success);
    const totalDeleted = successfulDeletions.reduce(
      (sum, r) => sum + (r.deletedCount || 0),
      0,
    );

    this.logger.log(chalk.blue('\n=== Deletion Summary ==='));
    this.logger.log(
      chalk.green(`Successfully deleted: ${totalDeleted} record(s) across ${successfulDeletions.length} entity type(s)`),
    );

    if (failedDeletions.length > 0) {
      this.logger.log(
        chalk.red(`Failed deletions: ${failedDeletions.length} entity type(s)`),
      );
      this.logger.log(chalk.red('\nFailed entity types:'));
      for (const failure of failedDeletions) {
        this.logger.log(chalk.red(`  - ${failure.entityName}: ${failure.error}`));
      }
    }
  }
}
