import { Command } from 'nest-commander';
import {
  getRecordPageLayoutUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeFlatDefaultRecordPageLayoutToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-default-record-page-layout-to-create.util';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type BackfillOperations = {
  viewsToCreate: UniversalFlatView[];
  viewFieldsToCreate: UniversalFlatViewField[];
  pageLayoutsToCreate: UniversalFlatPageLayout[];
  pageLayoutTabsToCreate: UniversalFlatPageLayoutTab[];
  pageLayoutWidgetsToCreate: UniversalFlatPageLayoutWidget[];
};

type BackfillOperationsByApplication = Map<string, BackfillOperations>;

@RegisteredWorkspaceCommand('2.28.0', 1785504605000)
@Command({
  name: 'upgrade:2-28:backfill-application-record-page',
  description:
    'Every object carries a system record-page stack; app-declared custom record-page layouts coexist with it (the frontend displays a custom layout over the system one when defined). This command backfills the system record-page stack for every application object missing it, converging upgraded installs with fresh installs where objectRecordPageOnCreate always emits it through the workspace migration pipeline: the FIELDS_WIDGET view (derived identifier, reserved key), its view fields for every displayable field except the label identifier, and the default layout with its 5 tabs and widgets. The backfill runs through the legacy pipeline path (no side-effect expansion: it replays a state the engine convention already defines) and is idempotent and retry-safe: view, view-field and layout creation are gated independently on their derived identifiers, so a retry after a partial failure still backfills the missing view fields of an already-committed view. The analogue for the twenty-standard and workspace-custom populations is the reconcile-record-page-universal-identifier command.',
})
export class BackfillApplicationRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
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
      flatViewMaps,
      flatViewFieldMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const engineOwnedApplicationUniversalIdentifiers = new Set([
      twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomFlatApplication.universalIdentifier,
    ]);

    const backfillOperationsByApplication =
      this.computeBackfillOperationsByApplication({
        engineOwnedApplicationUniversalIdentifiers,
        flatViewMaps,
        flatViewFieldMaps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatPageLayoutMaps,
      });

    const totalCreateCount = [
      ...backfillOperationsByApplication.values(),
    ].reduce(
      (count, operations) =>
        count +
        operations.viewsToCreate.length +
        operations.viewFieldsToCreate.length +
        operations.pageLayoutsToCreate.length +
        operations.pageLayoutTabsToCreate.length +
        operations.pageLayoutWidgetsToCreate.length,
      0,
    );

    if (totalCreateCount === 0) {
      this.logger.log(
        `No application record page to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${totalCreateCount} application record-page entit(ies) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.runBackfillMigrations({
      workspaceId,
      backfillOperationsByApplication,
    });

    this.logger.log(
      `Backfilled ${totalCreateCount} application record-page entit(ies) for workspace ${workspaceId}`,
    );
  }

  private computeBackfillOperationsByApplication({
    engineOwnedApplicationUniversalIdentifiers,
    flatViewMaps,
    flatViewFieldMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatPageLayoutMaps,
  }: {
    engineOwnedApplicationUniversalIdentifiers: Set<string>;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatPageLayoutMaps'
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
        viewsToCreate: [],
        viewFieldsToCreate: [],
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
      if (
        !isDefined(flatObjectMetadata) ||
        engineOwnedApplicationUniversalIdentifiers.has(
          flatObjectMetadata.applicationUniversalIdentifier,
        ) ||
        flatObjectMetadata.isRemote
      ) {
        continue;
      }

      const applicationUniversalIdentifier =
        flatObjectMetadata.applicationUniversalIdentifier;

      const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        viewKey: ViewKey.FIELDS_WIDGET,
      });

      const derivedPageLayoutUniversalIdentifier =
        getRecordPageLayoutUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        });

      const applicationBucket = getApplicationBucket(
        applicationUniversalIdentifier,
      );

      if (
        !isDefined(
          flatViewMaps.byUniversalIdentifier[derivedViewUniversalIdentifier],
        )
      ) {
        applicationBucket.viewsToCreate.push(
          computeFlatRecordPageFieldsViewToCreate({
            objectMetadata: flatObjectMetadata,
            applicationUniversalIdentifier,
          }),
        );
      }

      const objectFlatFieldMetadatas =
        flatObjectMetadata.fieldUniversalIdentifiers
          .map(
            (fieldUniversalIdentifier) =>
              flatFieldMetadataMaps.byUniversalIdentifier[
                fieldUniversalIdentifier
              ],
          )
          .filter(isDefined);

      applicationBucket.viewFieldsToCreate.push(
        ...computeFlatViewFieldsToCreate({
          objectFlatFieldMetadatas,
          viewUniversalIdentifier: derivedViewUniversalIdentifier,
          applicationUniversalIdentifier,
          labelIdentifierFieldMetadataUniversalIdentifier:
            flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
          excludeLabelIdentifier: true,
        }).filter(
          (flatViewFieldToCreate) =>
            !isDefined(
              flatViewFieldMaps.byUniversalIdentifier[
                flatViewFieldToCreate.universalIdentifier
              ],
            ),
        ),
      );

      if (
        !isDefined(
          flatPageLayoutMaps.byUniversalIdentifier[
            derivedPageLayoutUniversalIdentifier
          ],
        )
      ) {
        const { pageLayouts, pageLayoutTabs, pageLayoutWidgets } =
          computeFlatDefaultRecordPageLayoutToCreate({
            objectMetadata: flatObjectMetadata,
            applicationUniversalIdentifier,
            recordPageFieldsViewUniversalIdentifier:
              derivedViewUniversalIdentifier,
          });

        applicationBucket.pageLayoutsToCreate.push(...pageLayouts);
        applicationBucket.pageLayoutTabsToCreate.push(...pageLayoutTabs);
        applicationBucket.pageLayoutWidgetsToCreate.push(...pageLayoutWidgets);
      }
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
    // Views commit before view fields and layouts across applications: a view
    // field belongs to the application owning its displayed field, which can
    // differ from the application owning the object.
    for (const [
      applicationUniversalIdentifier,
      { viewsToCreate },
    ] of backfillOperationsByApplication.entries()) {
      if (viewsToCreate.length === 0) {
        continue;
      }

      await this.runBackfillMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          view: {
            flatEntityToCreate: viewsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    for (const [
      applicationUniversalIdentifier,
      {
        viewFieldsToCreate,
        pageLayoutsToCreate,
        pageLayoutTabsToCreate,
        pageLayoutWidgetsToCreate,
      },
    ] of backfillOperationsByApplication.entries()) {
      const operationCount =
        viewFieldsToCreate.length +
        pageLayoutsToCreate.length +
        pageLayoutTabsToCreate.length +
        pageLayoutWidgetsToCreate.length;

      if (operationCount === 0) {
        continue;
      }

      await this.runBackfillMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: viewFieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
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
        `Failed to backfill application record page(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill application record page(s) for workspace ${workspaceId}`,
      );
    }
  }
}
