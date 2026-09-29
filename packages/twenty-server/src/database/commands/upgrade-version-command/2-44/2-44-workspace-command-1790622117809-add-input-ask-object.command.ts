import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { collectInputAskStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-44/utils/collect-input-ask-standard-universal-identifiers.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const buildCreationOperations = <TFlatEntity extends SyncableFlatEntity>(
  standardFlatEntityMaps: FlatEntityMaps<TFlatEntity>,
  existingFlatEntityMaps: FlatEntityMaps<TFlatEntity>,
  universalIdentifiers: string[],
) => ({
  flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow({
    standardFlatEntityMaps,
    existingFlatEntityMaps,
    universalIdentifiers,
  }),
  flatEntityToDelete: [],
  flatEntityToUpdate: [],
});

@RegisteredWorkspaceCommand('2.44.0', 1790622117809)
@Command({
  name: 'upgrade:2-44:add-input-ask-object',
  description: 'Create the inputAsk standard object in existing workspaces',
})
export class AddInputAskObjectCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatSearchFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatSearchFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

    // The inverse relation fields land on these objects, so creating inputAsk
    // before they exist would build a relation with no other side.
    const missingRelationTarget = [
      STANDARD_OBJECTS.workflowRun,
      STANDARD_OBJECTS.workspaceMember,
      STANDARD_OBJECTS.agentChatThread,
    ].find(
      ({ universalIdentifier }) =>
        !isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier],
        ),
    );

    if (isDefined(missingRelationTarget)) {
      this.logger.warn(
        `Relation target object not found for workspace ${workspaceId}, skipping inputAsk object sync`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });
    const universalIdentifiers = collectInputAskStandardUniversalIdentifiers({
      standardAllFlatEntityMaps,
    });
    const allFlatEntityOperationByMetadataName = {
      objectMetadata: buildCreationOperations(
        standardAllFlatEntityMaps.flatObjectMetadataMaps,
        flatObjectMetadataMaps,
        universalIdentifiers.objectMetadata,
      ),
      fieldMetadata: buildCreationOperations(
        standardAllFlatEntityMaps.flatFieldMetadataMaps,
        flatFieldMetadataMaps,
        universalIdentifiers.fieldMetadata,
      ),
      index: buildCreationOperations(
        standardAllFlatEntityMaps.flatIndexMaps,
        flatIndexMaps,
        universalIdentifiers.index,
      ),
      searchFieldMetadata: buildCreationOperations(
        standardAllFlatEntityMaps.flatSearchFieldMetadataMaps,
        flatSearchFieldMetadataMaps,
        universalIdentifiers.searchFieldMetadata,
      ),
      view: buildCreationOperations(
        standardAllFlatEntityMaps.flatViewMaps,
        flatViewMaps,
        universalIdentifiers.view,
      ),
      viewField: buildCreationOperations(
        standardAllFlatEntityMaps.flatViewFieldMaps,
        flatViewFieldMaps,
        universalIdentifiers.viewField,
      ),
    };
    const totalOperationCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
      (total, operations) => total + operations.flatEntityToCreate.length,
      0,
    );

    if (totalOperationCount === 0) {
      this.logger.log(
        `inputAsk standard metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const creationSummary = `${allFlatEntityOperationByMetadataName.objectMetadata.flatEntityToCreate.length} inputAsk object(s), ${allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate.length} field(s), ${allFlatEntityOperationByMetadataName.index.flatEntityToCreate.length} index(es) and ${allFlatEntityOperationByMetadataName.view.flatEntityToCreate.length} view(s)`;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${creationSummary} for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to create the inputAsk object for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(`Created ${creationSummary} for workspace ${workspaceId}`);
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldGroupMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewFilterMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldGroupMaps',
      'flatViewFieldMaps',
    ]);
    const inputAskObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.inputAsk.universalIdentifier
      ];

    if (!isDefined(inputAskObject)) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // Deleting the object takes its own fields along; the inverse sides on
    // the other objects have to be named.
    const inverseFields = [
      STANDARD_OBJECTS.workflowRun.fields.inputAsks,
      STANDARD_OBJECTS.workspaceMember.fields.inputAsks,
      STANDARD_OBJECTS.agentChatThread.fields.inputAsks,
    ]
      .map(
        ({ universalIdentifier }) =>
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined);

    // Named explicitly too: a cascade in the database would leave them in
    // the cached maps, and a later up would take them as already there.
    const views = Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((view) => view.objectMetadataId === inputAskObject.id);
    const viewIds = new Set(views.map(({ id }) => id));
    const viewFieldGroups = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(({ viewId }) => viewIds.has(viewId));
    const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ viewId }) => viewIds.has(viewId));
    const viewFilters = Object.values(flatViewFilterMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ viewId }) => viewIds.has(viewId));

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [inputAskObject],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: views,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldGroups,
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFields,
              flatEntityToUpdate: [],
            },
            viewFilter: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFilters,
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: inverseFields,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to remove the inputAsk object for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }
  }
}
