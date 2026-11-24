import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const CHANNEL_ASSOCIATION_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
];

const CHANNEL_ASSOCIATION_ACCOUNT_OWNER_INDEX_UNIVERSAL_IDENTIFIERS = [
  '740776d1-fe14-41b9-80b9-11c610765f0c',
  '0797b417-8f87-4df1-b838-d85fbb663110',
];

const CHANNEL_ASSOCIATION_DYNAMIC_COLUMN_NAMES = ['accountOwnerId', 'handle'];

@RegisteredWorkspaceCommand('2.64.0', 1795556704531)
@Command({
  name: 'upgrade:2-64:drop-channel-association-account-owner-and-handle-columns',
  description:
    'Drop the account owner and handle columns and the account owner index from calendar and message channel associations',
})
export class DropChannelAssociationAccountOwnerAndHandleColumnsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatIndexMaps',
      ]);

    const indexesToDelete =
      CHANNEL_ASSOCIATION_ACCOUNT_OWNER_INDEX_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
            flatEntityMaps: flatIndexMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);
    const channelAssociationFlatObjectMetadatas =
      CHANNEL_ASSOCIATION_OBJECT_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would delete ${indexesToDelete.length} index(es) and drop the account owner and handle columns of ${channelAssociationFlatObjectMetadatas.length} table(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (indexesToDelete.length > 0) {
      const { twentyStandardFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        );

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            shouldDeferActions: false,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
            workspaceId,
            allFlatEntityOperationByMetadataName: {
              index: {
                flatEntityToCreate: [],
                flatEntityToDelete: indexesToDelete,
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }

    for (const flatObjectMetadata of channelAssociationFlatObjectMetadatas) {
      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });
      const dropColumnClauses = CHANNEL_ASSOCIATION_DYNAMIC_COLUMN_NAMES.map(
        (columnName) => `DROP COLUMN IF EXISTS ${escapeIdentifier(columnName)}`,
      );

      await this.dataSource.query(
        `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ${dropColumnClauses.join(', ')}`,
      );
    }

    this.logger.log(
      `Deleted ${indexesToDelete.length} index(es) and dropped the account owner and handle columns of ${channelAssociationFlatObjectMetadatas.length} table(s) for workspace ${workspaceId}`,
    );
  }
}
