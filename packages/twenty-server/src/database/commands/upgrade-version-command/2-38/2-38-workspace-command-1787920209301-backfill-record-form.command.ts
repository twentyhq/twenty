import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-flat-field-metadatas.util';
import { buildSystemFormFieldPageLayoutWidget } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-system-form-field-page-layout-widget.util';
import { computeSystemRecordFormPageLayoutToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-record-form-page-layout-to-create.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

type BackfillOperations = {
  pageLayoutsToCreate: UniversalFlatPageLayout[];
  pageLayoutTabsToCreate: UniversalFlatPageLayoutTab[];
  pageLayoutWidgetsToCreate: UniversalFlatPageLayoutWidget[];
};

type BackfillOperationsByApplication = Map<string, BackfillOperations>;

@RegisteredWorkspaceCommand('2.38.0', 1787920209301)
@Command({
  name: 'upgrade:2-38:backfill-record-form',
  description:
    'Backfill the RECORD_FORM page layout stack for every workspace-custom and application object missing it, converging upgraded installs with the stack objectRecordFormOnCreate and fieldRecordFormWidgetOnCreate now emit at creation time. Each object gets one layout, one "Fields" tab and one FORM_FIELD widget per creatable field, label identifier first, in record-page field order. Fields the form cannot render (system, non UI editable, id, and any type the form has no input for, which today means ACTOR, FILES, NUMERIC, POSITION, RATING, TS_VECTOR and relations other than MANY_TO_ONE) are skipped. Every entity is isSystemSideEffect with the same derived universal identifiers the engine uses, so the backfill is idempotent: objects whose derived layout already exists are skipped entirely, and on a layout that exists with missing widgets only the missing ones are topped up, which also makes a retry after a partial failure safe. Widgets land in the migration bucket of the application owning their displayed field, matching the engine emission for app-contributed fields on foreign objects. Twenty-standard objects are skipped: they never reach the side-effect engine, so their form is authored in the standard definitions instead, which reach fresh and upgraded workspaces alike through the normal standard sync.',
})
export class BackfillRecordFormCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const backfillOperationsByApplication =
      this.computeBackfillOperationsByApplication({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatPageLayoutMaps,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
      });

    const totalCreateCount = [
      ...backfillOperationsByApplication.values(),
    ].reduce(
      (count, operations) =>
        count +
        operations.pageLayoutsToCreate.length +
        operations.pageLayoutTabsToCreate.length +
        operations.pageLayoutWidgetsToCreate.length,
      0,
    );

    if (totalCreateCount === 0) {
      this.logger.log(`No record form to backfill for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${totalCreateCount} record-form entit(ies) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.runBackfillMigrations({
      workspaceId,
      backfillOperationsByApplication,
    });

    this.logger.log(
      `Backfilled ${totalCreateCount} record-form entit(ies) for workspace ${workspaceId}`,
    );
  }

  private computeBackfillOperationsByApplication({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  }: Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatPageLayoutMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): BackfillOperationsByApplication {
    const backfillOperationsByApplication: BackfillOperationsByApplication =
      new Map();

    const getApplicationBucket = (applicationUniversalIdentifier: string) => {
      const existingBucket = backfillOperationsByApplication.get(
        applicationUniversalIdentifier,
      );

      if (isDefined(existingBucket)) {
        return existingBucket;
      }

      const newBucket: BackfillOperations = {
        pageLayoutsToCreate: [],
        pageLayoutTabsToCreate: [],
        pageLayoutWidgetsToCreate: [],
      };

      backfillOperationsByApplication.set(
        applicationUniversalIdentifier,
        newBucket,
      );

      return newBucket;
    };

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      const isTwentyStandardObject =
        flatObjectMetadata?.applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier;

      if (
        !isDefined(flatObjectMetadata) ||
        flatObjectMetadata.isRemote ||
        isTwentyStandardObject
      ) {
        continue;
      }

      const { pageLayout, pageLayoutTab } =
        computeSystemRecordFormPageLayoutToCreate({
          objectMetadata: flatObjectMetadata,
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
        });

      const existingFlatPageLayout =
        flatPageLayoutMaps.byUniversalIdentifier[
          pageLayout.universalIdentifier
        ];
      const existingFlatPageLayoutTab =
        flatPageLayoutTabMaps.byUniversalIdentifier[
          pageLayoutTab.universalIdentifier
        ];

      const objectApplicationBucket = getApplicationBucket(
        flatObjectMetadata.applicationUniversalIdentifier,
      );

      if (!isDefined(existingFlatPageLayout)) {
        objectApplicationBucket.pageLayoutsToCreate.push(pageLayout);
      }

      if (!isDefined(existingFlatPageLayoutTab)) {
        objectApplicationBucket.pageLayoutTabsToCreate.push(pageLayoutTab);
      }

      const orderedFormFlatFieldMetadatas = computeRecordFormFlatFieldMetadatas(
        {
          flatFieldMetadatas: flatObjectMetadata.fieldUniversalIdentifiers
            .map(
              (fieldUniversalIdentifier) =>
                flatFieldMetadataMaps.byUniversalIdentifier[
                  fieldUniversalIdentifier
                ],
            )
            .filter(isDefined)
            .filter(
              (flatFieldMetadata) => !flatFieldMetadata.isSystemSideEffect,
            ),
          labelIdentifierFieldMetadataUniversalIdentifier:
            flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
        },
      );

      orderedFormFlatFieldMetadatas.forEach((flatFieldMetadata, index) => {
        const pageLayoutWidget = buildSystemFormFieldPageLayoutWidget({
          applicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          pageLayoutTabUniversalIdentifier: pageLayoutTab.universalIdentifier,
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          flatFieldMetadata,
          index,
        });

        if (
          isDefined(
            flatPageLayoutWidgetMaps.byUniversalIdentifier[
              pageLayoutWidget.universalIdentifier
            ],
          )
        ) {
          return;
        }

        getApplicationBucket(
          flatFieldMetadata.applicationUniversalIdentifier,
        ).pageLayoutWidgetsToCreate.push(pageLayoutWidget);
      });
    }

    return backfillOperationsByApplication;
  }

  private async runBackfillMigrations({
    workspaceId,
    backfillOperationsByApplication,
  }: {
    workspaceId: string;
    backfillOperationsByApplication: BackfillOperationsByApplication;
  }): Promise<void> {
    for (const [
      applicationUniversalIdentifier,
      { pageLayoutsToCreate, pageLayoutTabsToCreate },
    ] of backfillOperationsByApplication.entries()) {
      if (
        pageLayoutsToCreate.length === 0 &&
        pageLayoutTabsToCreate.length === 0
      ) {
        continue;
      }

      await this.runBackfillMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          pageLayout: {
            flatEntityToCreate: pageLayoutsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          pageLayoutTab: {
            flatEntityToCreate: pageLayoutTabsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    for (const [
      applicationUniversalIdentifier,
      { pageLayoutWidgetsToCreate },
    ] of backfillOperationsByApplication.entries()) {
      if (pageLayoutWidgetsToCreate.length === 0) {
        continue;
      }

      await this.runBackfillMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          pageLayoutWidget: {
            flatEntityToCreate: pageLayoutWidgetsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }
  }

  private async runBackfillMigration({
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityOperationByMetadataName,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityOperationByMetadataName: Record<
      string,
      {
        flatEntityToCreate: unknown[];
        flatEntityToDelete: never[];
        flatEntityToUpdate: never[];
      }
    >;
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName:
            allFlatEntityOperationByMetadataName as never,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to backfill record form(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill record form(s) for workspace ${workspaceId}`,
      );
    }
  }
}
