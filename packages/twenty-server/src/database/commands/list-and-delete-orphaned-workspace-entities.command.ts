import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import {
  MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { PostgresCredentialsEntity } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WebhookEntity } from 'src/engine/core-modules/webhook/webhook.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

type DeletionResult = {
  entityName: string;
  success: boolean;
  deletedCount?: number;
  error?: string;
};

// All entities that extend WorkspaceRelatedEntity or SyncableEntity
// Ordered by dependency: CHILDREN FIRST to minimize CASCADE overhead
const WORKSPACE_RELATED_ENTITIES: EntityTarget<ObjectLiteral>[] = [
  // Level 4: Deepest children - delete these first to avoid CASCADE overhead
  ViewFieldEntity,
  ViewFilterEntity,
  ViewGroupEntity,
  ViewSortEntity,
  ViewFilterGroupEntity,
  FieldPermissionEntity,
  ObjectPermissionEntity,
  PermissionFlagEntity,
  RoleTargetEntity,
  SearchFieldMetadataEntity,
  RowLevelPermissionPredicateEntity,
  PageLayoutWidgetEntity,

  // Level 3: Mid-level children
  RowLevelPermissionPredicateGroupEntity,
  ViewEntity,
  IndexMetadataEntity,
  PageLayoutTabEntity,
  RemoteTableEntity,
  RouteTriggerEntity,
  CronTriggerEntity,
  DatabaseEventTriggerEntity,

  // Level 2: Children that depend on core entities
  FieldMetadataEntity,
  PageLayoutEntity,
  SkillEntity,
  ServerlessFunctionEntity,

  // Level 1: Core entities with CASCADE deletes - delete after their children
  ObjectMetadataEntity,
  RoleEntity,
  AgentEntity,
  RemoteServerEntity,
  UserWorkspaceEntity,
  ApiKeyEntity,
  ServerlessFunctionLayerEntity,

  // Level 0: Independent entities (no foreign keys to other workspace entities)
  ApplicationEntity,
  ApprovedAccessDomainEntity,
  BillingCustomerEntity,
  BillingEntitlementEntity,
  BillingSubscriptionEntity,
  DataSourceEntity,
  EmailingDomainEntity,
  FeatureFlagEntity,
  FileEntity,
  PostgresCredentialsEntity,
  PublicDomainEntity,
  WebhookEntity,
  WorkspaceMigrationEntity,
  WorkspaceSSOIdentityProviderEntity,
];

type OrphanedRecord = {
  entityName: string;
  id: string;
  workspaceId: string;
};

@Command({
  name: 'workspace:list-and-delete-orphaned-entities',
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

  private async deleteInChunks({
    entity,
    entityName,
    ids,
    chunkSize = 2000,
  }: {
    entity: EntityTarget<ObjectLiteral>;
    ids: string[];
    entityName: string;
    chunkSize?: number;
  }): Promise<number> {
    let totalDeleted = 0;
    const chunks: string[][] = [];

    let i = 0;

    while (i < ids.length) {
      chunks.push(ids.slice(i, i + chunkSize));
      i += chunkSize;
    }

    for (const [index, chunk] of chunks.entries()) {
      this.logger.log(
        chalk.gray(
          `    Deleting ${entityName} chunk ${index + 1}/${chunks.length} (${chunk.length} records)...`,
        ),
      );

      try {
        const result = await this.dataSource
          .getRepository(entity)
          .createQueryBuilder()
          .delete()
          .from(entity)
          .whereInIds(chunk)
          .execute();

        totalDeleted += result.affected || 0;
      } catch (error) {
        this.logger.warn(
          chalk.yellow(
            `    ⚠ Failed to delete chunk ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }

    return totalDeleted;
  }

  private async deleteFieldMetadataInChunks(ids: string[]): Promise<number> {
    const CHUNK_SIZE = 50;
    let totalDeleted = 0;

    const fieldMetadataRepository =
      this.dataSource.getRepository(FieldMetadataEntity);
    const fields = await fieldMetadataRepository
      .createQueryBuilder('field')
      .where('field.id IN (:...ids)', { ids })
      .getMany();

    const processedIds = new Set<string>();
    const fieldsMap = new Map(fields.map((field) => [field.id, field]));
    const chunks: string[][] = [];
    let currentChunk: string[] = [];

    for (const field of fields) {
      if (processedIds.has(field.id)) {
        continue;
      }

      currentChunk.push(field.id);
      processedIds.add(field.id);

      if (field.relationTargetFieldMetadataId) {
        const relatedField = fieldsMap.get(field.relationTargetFieldMetadataId);

        if (relatedField && !processedIds.has(relatedField.id)) {
          currentChunk.push(relatedField.id);
          processedIds.add(relatedField.id);
        }
      }

      if (currentChunk.length >= CHUNK_SIZE) {
        chunks.push([...currentChunk]);
        currentChunk = [];
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    for (const [index, chunk] of chunks.entries()) {
      this.logger.log(
        chalk.gray(
          `    Deleting FieldMetadata chunk ${index + 1}/${chunks.length} (${chunk.length} fields with relations)...`,
        ),
      );

      try {
        const result = await fieldMetadataRepository
          .createQueryBuilder()
          .delete()
          .from(FieldMetadataEntity)
          .whereInIds(chunk)
          .execute();

        totalDeleted += result.affected || 0;
      } catch (error) {
        this.logger.warn(
          chalk.yellow(
            `    ⚠ Failed to delete chunk ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }

    return totalDeleted;
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    this.logger.log(
      chalk.blue(
        'Looking for orphaned records in workspace-related entities...',
      ),
    );

    const allOrphanedRecords: OrphanedRecord[] = [];
    const orphanedIdsByEntity = new Map<
      EntityTarget<ObjectLiteral>,
      string[]
    >();

    for (const entity of WORKSPACE_RELATED_ENTITIES) {
      const entityName =
        typeof entity === 'function' ? entity.name : String(entity);

      try {
        const orphanedRecords = await this.dataSource
          .getRepository(entity)
          .createQueryBuilder('entity')
          .where((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from(WorkspaceEntity, 'workspace')
              .where('workspace.id = entity.workspaceId')
              .withDeleted()
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          })
          .select(['entity.id', 'entity.workspaceId'])
          .withDeleted()
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
      } catch {
        this.logger.warn(
          chalk.gray(
            `  ${entityName}: Skipped (entity not found in current context)`,
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
        `Total: ${allOrphanedRecords.length} orphaned record(s) across ${orphanedIdsByEntity.size} entity type(s)`,
      ),
    );

    this.logger.log(
      chalk.yellow(`${allOrphanedRecords.length} record(s) to be deleted.`),
    );

    this.logger.log(
      `Deleting ${allOrphanedRecords.length} orphaned record(s)...`,
    );
    this.logger.log(
      chalk.gray(
        'Note: Some entities may show 0 deleted due to CASCADE deletes from parent entities',
      ),
    );

    const deletionResults: DeletionResult[] = [];

    for (const [entity, ids] of orphanedIdsByEntity) {
      const entityName =
        typeof entity === 'function' ? entity.name : String(entity);

      this.logger.log(
        chalk.gray(`  Processing ${entityName} (${ids.length} records)...`),
      );

      try {
        let deletedCount = 0;

        if (!options.dryRun) {
          if (entityName === 'FieldMetadataEntity') {
            deletedCount = await this.deleteFieldMetadataInChunks(ids);
          } else {
            deletedCount = await this.deleteInChunks({
              entity,
              ids,
              entityName,
            });
          }
        }

        deletionResults.push({
          entityName,
          success: true,
          deletedCount,
        });

        this.logger.log(
          chalk.green(`  ✓ Deleted ${deletedCount} ${entityName} record(s)`),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        deletionResults.push({
          entityName,
          success: false,
          error: errorMessage,
        });

        this.logger.error(
          chalk.red(
            `  ✗ Failed to delete ${entityName} records: ${errorMessage}`,
          ),
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
      chalk.green(
        `Successfully deleted: ${totalDeleted} record(s) across ${successfulDeletions.length} entity type(s)`,
      ),
    );

    if (failedDeletions.length > 0) {
      this.logger.log(
        chalk.red(`Failed deletions: ${failedDeletions.length} entity type(s)`),
      );
      this.logger.log(chalk.red('\nFailed entity types:'));
      for (const failure of failedDeletions) {
        this.logger.log(
          chalk.red(`  - ${failure.entityName}: ${failure.error}`),
        );
      }
    }
  }
}
