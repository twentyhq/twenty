import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeRecordFormWidgetForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-widget-for-existing-object.util';
import { getRecordFormPageLayoutTabUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/get-record-form-page-layout-tab-universal-identifier.util';
import { isFlatFieldMetadataEligibleForRecordForm } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

@RegisteredWorkspaceCommand('2.52.0', 1792861553907)
@Command({
  name: 'upgrade:2-52:backfill-files-record-form-widgets',
  description:
    'Add the record form FORM_FIELD widget of every FILES field created before FILES fields became eligible for the record form, appended after the last widget of its object form, as fieldRecordFormWidgetOnCreate does for a new field',
})
export class BackfillFilesRecordFormWidgetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const filesFlatFieldMetadatasByObject = new Map<
      string,
      UniversalFlatFieldMetadata[]
    >();

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.type !== FieldMetadataType.FILES ||
        !isFlatFieldMetadataEligibleForRecordForm(flatFieldMetadata)
      ) {
        continue;
      }

      const objectFilesFlatFieldMetadatas =
        filesFlatFieldMetadatasByObject.get(
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        ) ?? [];

      filesFlatFieldMetadatasByObject.set(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
        [...objectFilesFlatFieldMetadatas, flatFieldMetadata],
      );
    }

    const widgetsToCreateByApplication = new Map<
      string,
      UniversalFlatPageLayoutWidget[]
    >();

    for (const [
      objectMetadataUniversalIdentifier,
      filesFlatFieldMetadatas,
    ] of filesFlatFieldMetadatasByObject.entries()) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata) || flatObjectMetadata.isRemote) {
        continue;
      }

      const recordFormPageLayoutTabUniversalIdentifier =
        getRecordFormPageLayoutTabUniversalIdentifier({
          objectApplicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        });

      for (const filesFlatFieldMetadata of filesFlatFieldMetadatas) {
        const widgetToCreate = computeRecordFormWidgetForExistingObject({
          sourceFlatFieldMetadata: filesFlatFieldMetadata,
          orderedFormFlatFieldMetadatasInBatch: filesFlatFieldMetadatas,
          recordFormPageLayoutTabUniversalIdentifier,
          flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps,
        });

        // A widget the user deleted keeps its universal identifier
        if (
          !isDefined(widgetToCreate) ||
          isDefined(
            flatPageLayoutWidgetMaps.byUniversalIdentifier[
              widgetToCreate.universalIdentifier
            ],
          )
        ) {
          continue;
        }

        widgetsToCreateByApplication.set(
          widgetToCreate.applicationUniversalIdentifier,
          [
            ...(widgetsToCreateByApplication.get(
              widgetToCreate.applicationUniversalIdentifier,
            ) ?? []),
            widgetToCreate,
          ],
        );
      }
    }

    const widgetToCreateCount = [
      ...widgetsToCreateByApplication.values(),
    ].reduce((count, widgetsToCreate) => count + widgetsToCreate.length, 0);

    if (widgetToCreateCount === 0) {
      this.logger.log(
        `No files record form widget to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${widgetToCreateCount} files record form widget(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const [
      applicationUniversalIdentifier,
      widgetsToCreate,
    ] of widgetsToCreateByApplication.entries()) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              pageLayoutWidget: {
                flatEntityToCreate: widgetsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to backfill files record form widgets for application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Backfilled ${widgetToCreateCount} files record form widget(s) for workspace ${workspaceId}`,
    );
  }
}
