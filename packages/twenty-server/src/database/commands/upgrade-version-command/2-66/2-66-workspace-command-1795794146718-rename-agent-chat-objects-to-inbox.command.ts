import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildInboxCommandMenuItemExpressionUpdates } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-command-menu-item-expression-updates.util';
import { buildInboxFlatObjectMetadataUpdates } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-flat-object-metadata-updates.util';
import { buildInboxIndexRenames } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-index-renames.util';
import { buildInboxNameCollisionFlatFieldMetadataUpdates } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-name-collision-flat-field-metadata-updates.util';
import { buildInboxNameCollisionFlatObjectMetadataUpdates } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-name-collision-flat-object-metadata-updates.util';
import { buildInboxRelationFlatFieldMetadataUpdates } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-relation-flat-field-metadata-updates.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type RenameStepArgs = {
  workspaceId: string;
  isDryRun: boolean;
};

type RenamedMetadataName =
  | 'objectMetadata'
  | 'fieldMetadata'
  | 'commandMenuItem';

type RenamedFlatEntity<TMetadataName extends RenamedMetadataName> = NonNullable<
  AllFlatEntityOperationByMetadataName[TMetadataName]
>['flatEntityToUpdate'][number];

type RenameFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatIndexMaps'
  | 'flatCommandMenuItemMaps'
>;

const getFlatEntityName = (
  flatEntity: RenamedFlatEntity<RenamedMetadataName>,
): string =>
  'nameSingular' in flatEntity
    ? flatEntity.nameSingular
    : 'name' in flatEntity
      ? flatEntity.name
      : flatEntity.label;

@RegisteredWorkspaceCommand('2.66.0', 1795794146718)
@Command({
  name: 'upgrade:2-66:rename-agent-chat-objects-to-inbox',
  description:
    'Rename the agent chat objects and their relation fields to the inbox prefix, then turn the inbox object naming flag on',
})
export class RenameAgentChatObjectsToInboxCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.loadFlatEntityMaps(workspaceId);

    const hasAgentChatObjects = isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    );

    if (!hasAgentChatObjects || !isDefined(dataSource)) {
      this.logger.log(
        `Workspace ${workspaceId}: no agent chat objects or no data source, skipping`,
      );

      return;
    }

    const stepArgs = { workspaceId, isDryRun: options.dryRun ?? false };
    const now = new Date().toISOString();

    await this.updateFlatEntitiesAsTheirApplication({
      ...stepArgs,
      metadataName: 'objectMetadata',
      description: 'moving colliding object(s) aside as',
      buildFlatEntitiesToUpdate: (flatEntityMaps) =>
        buildInboxNameCollisionFlatObjectMetadataUpdates({
          flatObjectMetadataMaps: flatEntityMaps.flatObjectMetadataMaps,
          now,
        }),
    });

    await this.updateFlatEntitiesAsTheirApplication({
      ...stepArgs,
      metadataName: 'fieldMetadata',
      description: 'moving colliding field(s) aside as',
      buildFlatEntitiesToUpdate: ({ flatFieldMetadataMaps }) =>
        buildInboxNameCollisionFlatFieldMetadataUpdates({
          flatFieldMetadataMaps,
          inboxRelationFlatFieldMetadataUpdates:
            buildInboxRelationFlatFieldMetadataUpdates({
              flatFieldMetadataMaps,
              now,
            }),
          now,
        }),
    });

    await this.renameIndexes({ ...stepArgs, dataSource });

    await this.updateFlatEntitiesAsTheirApplication({
      ...stepArgs,
      metadataName: 'objectMetadata',
      description: 'renaming agent chat object(s) to',
      buildFlatEntitiesToUpdate: (flatEntityMaps) =>
        buildInboxFlatObjectMetadataUpdates({
          flatObjectMetadataMaps: flatEntityMaps.flatObjectMetadataMaps,
          now,
        }),
    });

    await this.updateFlatEntitiesAsTheirApplication({
      ...stepArgs,
      metadataName: 'fieldMetadata',
      description: 'renaming agent chat relation field(s) to',
      buildFlatEntitiesToUpdate: ({ flatFieldMetadataMaps }) =>
        buildInboxRelationFlatFieldMetadataUpdates({
          flatFieldMetadataMaps,
          now,
        }),
    });

    await this.updateFlatEntitiesAsTheirApplication({
      ...stepArgs,
      metadataName: 'commandMenuItem',
      description:
        'rewriting agent chat object names in the expressions of command menu item(s)',
      buildFlatEntitiesToUpdate: ({ flatCommandMenuItemMaps }) =>
        buildInboxCommandMenuItemExpressionUpdates({
          flatCommandMenuItemMaps,
          now,
        }),
    });

    await this.enableInboxObjectNaming(stepArgs);
  }

  private async loadFlatEntityMaps(
    workspaceId: string,
  ): Promise<RenameFlatEntityMaps> {
    return this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatCommandMenuItemMaps',
    ]);
  }

  private async updateFlatEntitiesAsTheirApplication<
    TMetadataName extends RenamedMetadataName,
  >({
    workspaceId,
    isDryRun,
    metadataName,
    description,
    buildFlatEntitiesToUpdate,
  }: RenameStepArgs & {
    metadataName: TMetadataName;
    description: string;
    buildFlatEntitiesToUpdate: (
      flatEntityMaps: RenameFlatEntityMaps,
    ) => RenamedFlatEntity<TMetadataName>[];
  }): Promise<void> {
    const flatEntitiesToUpdate = buildFlatEntitiesToUpdate(
      await this.loadFlatEntityMaps(workspaceId),
    );

    if (flatEntitiesToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${description} ${flatEntitiesToUpdate
        .map(getFlatEntityName)
        .join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const applicationUniversalIdentifiers = new Set(
      flatEntitiesToUpdate.map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              [metadataName]: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: flatEntitiesToUpdate.filter(
                  (flatEntityToUpdate) =>
                    flatEntityToUpdate.applicationUniversalIdentifier ===
                    applicationUniversalIdentifier,
                ),
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }

  private async renameIndexes({
    workspaceId,
    isDryRun,
    dataSource,
  }: RenameStepArgs & { dataSource: DataSource }): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.loadFlatEntityMaps(workspaceId);

    const inboxIndexRenames = buildInboxIndexRenames({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      inboxRelationFlatFieldMetadataUpdates:
        buildInboxRelationFlatFieldMetadataUpdates({
          flatFieldMetadataMaps,
          now: new Date().toISOString(),
        }),
    });

    if (inboxIndexRenames.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: renaming ${inboxIndexRenames.length} index(es) ${inboxIndexRenames
        .map(({ fromName, toName }) => `${fromName} -> ${toName}`)
        .join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { indexMetadataId, fromName, toName } of inboxIndexRenames) {
        await this.workspaceSchemaManagerService.indexManager.renameIndexWithoutRebuild(
          {
            queryRunner,
            schemaName,
            fromIndexName: fromName,
            toIndexName: toName,
          },
        );

        await queryRunner.manager
          .getRepository(IndexMetadataEntity)
          .update({ id: indexMetadataId, workspaceId }, { name: toName });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      ...new Set(
        ['index' as const, ...getMetadataRelatedMetadataNames('index')].map(
          getMetadataFlatEntityMapsKey,
        ),
      ),
    ]);
  }

  private async enableInboxObjectNaming({
    workspaceId,
    isDryRun,
  }: RenameStepArgs): Promise<void> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (featureFlagsMap[FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: enabling ${FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED}`,
    );

    if (isDryRun) {
      return;
    }

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED],
      workspaceId,
    );
  }
}
