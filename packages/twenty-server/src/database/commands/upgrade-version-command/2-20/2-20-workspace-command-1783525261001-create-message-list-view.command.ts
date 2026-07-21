import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LIST = STANDARD_OBJECTS.messageList;

const LIST_VIEW_UNIVERSAL_IDENTIFIER =
  LIST.views.allMessageLists.universalIdentifier;

const LIST_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  LIST.views.allMessageLists.viewFields,
).map((viewField) => viewField.universalIdentifier);

@RegisteredWorkspaceCommand('2.20.0', 1783525261001)
@Command({
  name: 'upgrade:2-20:create-message-list-view',
  description:
    'Create the MessageList standard view and its columns on existing workspaces',
})
export class CreateMessageListViewCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
        'flatViewFieldMaps',
      ]);

    const listObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: LIST.universalIdentifier,
      });

    if (!isDefined(listObjectMetadata)) {
      this.logger.log(
        `messageList object does not exist for workspace ${workspaceId}, skipping`,
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

    const viewsToCreate = this.resolveViewsToCreate({
      flatViewMaps,
      standardAllFlatEntityMaps,
    });

    const viewFieldsToCreate = LIST_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
      (universalIdentifier) =>
        !isDefined(flatViewFieldMaps.byUniversalIdentifier[universalIdentifier]),
    ).map((universalIdentifier) => {
      const standardViewField =
        findFlatEntityByUniversalIdentifier<FlatViewField>({
          flatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          universalIdentifier,
        });

      if (!isDefined(standardViewField)) {
        throw new Error(
          `Standard application is missing messageList view column ${universalIdentifier}`,
        );
      }

      return standardViewField;
    });

    if (viewsToCreate.length === 0 && viewFieldsToCreate.length === 0) {
      this.logger.log(
        `messageList view already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${viewsToCreate.length} view(s), ${viewFieldsToCreate.length} view column(s)`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to create messageList view:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to create messageList view for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Created messageList view for workspace ${workspaceId}`);
  }

  private resolveViewsToCreate({
    flatViewMaps,
    standardAllFlatEntityMaps,
  }: {
    flatViewMaps: WorkspaceCacheDataMap['flatViewMaps'];
    standardAllFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
  }): FlatView[] {
    if (
      isDefined(
        flatViewMaps.byUniversalIdentifier[LIST_VIEW_UNIVERSAL_IDENTIFIER],
      )
    ) {
      return [];
    }

    const standardView = findFlatEntityByUniversalIdentifier<FlatView>({
      flatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
      universalIdentifier: LIST_VIEW_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(standardView)) {
      throw new Error(
        `Standard application is missing messageList view ${LIST_VIEW_UNIVERSAL_IDENTIFIER}`,
      );
    }

    return [standardView];
  }
}
