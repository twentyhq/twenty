import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateIndexViewReconcileCache } from 'src/database/commands/upgrade-version-command/2-26/utils/invalidate-index-view-reconcile-cache.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { computeFlatIndexViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-index-view-to-create.util';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type BackfillOperationsByApplication = Map<
  string,
  {
    viewsToCreate: UniversalFlatView[];
    viewFieldsToCreate: UniversalFlatViewField[];
  }
>;

@RegisteredWorkspaceCommand('2.26.0', 1785255690000)
@Command({
  name: 'upgrade:2-26:demote-and-backfill-application-index-view',
  description:
    'Manifest-installed applications never had their INDEX view auto-provisioned: the ones that declared a view with ViewKey.INDEX authored it themselves under a manifest identifier. The engine is now the sole owner of the INDEX key, so every caller-authored (isSystemSideEffect: false) INDEX view owned by an application other than twenty-standard and workspace-custom is demoted to key: null — it becomes a plain additional view under its manifest identifier, and the flat view validator rejects caller-provided INDEX keys so a later app sync cannot promote it back. Every application object left without an engine-owned INDEX view then gets one backfilled through the workspace migration pipeline with its full view-field layout, converging upgraded installs with fresh installs. Views are committed before view fields across all applications because a view field belongs to the application owning its field, which can differ from the application owning the object (fields can be created on another application object).',
})
export class DemoteAndBackfillApplicationIndexViewCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
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
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const engineOwnedApplicationUniversalIdentifiers = new Set([
      twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomFlatApplication.universalIdentifier,
    ]);

    const viewIdsToDemote: string[] = [];
    // Objects already holding an engine-owned INDEX view (a previous run of
    // this command); demoting or re-backfilling them would not be idempotent.
    const objectUniversalIdentifiersWithEngineIndexView = new Set<string>();

    for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
      if (
        !isDefined(flatView) ||
        flatView.key !== ViewKey.INDEX ||
        isDefined(flatView.deletedAt) ||
        engineOwnedApplicationUniversalIdentifiers.has(
          flatView.applicationUniversalIdentifier,
        )
      ) {
        continue;
      }

      if (flatView.isSystemSideEffect === true) {
        objectUniversalIdentifiersWithEngineIndexView.add(
          flatView.objectMetadataUniversalIdentifier,
        );
        continue;
      }

      viewIdsToDemote.push(flatView.id);
    }

    const backfillOperationsByApplication =
      this.computeBackfillOperationsByApplication({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        engineOwnedApplicationUniversalIdentifiers,
        objectUniversalIdentifiersWithEngineIndexView,
      });

    const backfillViewCount = [
      ...backfillOperationsByApplication.values(),
    ].reduce((count, { viewsToCreate }) => count + viewsToCreate.length, 0);

    if (viewIdsToDemote.length === 0 && backfillViewCount === 0) {
      this.logger.log(
        `No application INDEX view to demote or backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Demoting ${viewIdsToDemote.length} application INDEX view(s) and backfilling ${backfillViewCount} engine INDEX view(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    if (viewIdsToDemote.length > 0) {
      await this.viewRepository.manager.transaction(async (entityManager) => {
        const transactionalViewRepository =
          entityManager.getRepository(ViewEntity);

        for (const viewId of viewIdsToDemote) {
          await transactionalViewRepository.update(
            { id: viewId, workspaceId },
            { key: null },
          );
        }
      });

      // The backfill pipeline validates against fresh flat maps: the singleton
      // INDEX validator must see the demotions.
      await invalidateIndexViewReconcileCache({
        workspaceId,
        workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
      });
    }

    await this.runBackfillMigrations({
      workspaceId,
      backfillOperationsByApplication,
    });

    this.logger.log(
      `Demoted ${viewIdsToDemote.length} application INDEX view(s) and backfilled ${backfillViewCount} engine INDEX view(s) for workspace ${workspaceId}`,
    );
  }

  // Engine INDEX views for every application object that has none, with the
  // full default layout, mirroring what objectSystemFieldsAndIndexViewOnCreate
  // emits at object creation.
  private computeBackfillOperationsByApplication({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    engineOwnedApplicationUniversalIdentifiers,
    objectUniversalIdentifiersWithEngineIndexView,
  }: {
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
    engineOwnedApplicationUniversalIdentifiers: Set<string>;
    objectUniversalIdentifiersWithEngineIndexView: Set<string>;
  }): BackfillOperationsByApplication {
    const backfillOperationsByApplication: BackfillOperationsByApplication =
      new Map();

    const getApplicationBucket = (applicationUniversalIdentifier: string) => {
      const existingBucket = backfillOperationsByApplication.get(
        applicationUniversalIdentifier,
      );

      if (isDefined(existingBucket)) {
        return existingBucket;
      }

      const newBucket = { viewsToCreate: [], viewFieldsToCreate: [] };

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
        objectUniversalIdentifiersWithEngineIndexView.has(
          flatObjectMetadata.universalIdentifier,
        )
      ) {
        continue;
      }

      const flatIndexViewToCreate = computeFlatIndexViewToCreate({
        objectMetadata: flatObjectMetadata,
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
      });

      getApplicationBucket(
        flatObjectMetadata.applicationUniversalIdentifier,
      ).viewsToCreate.push(flatIndexViewToCreate);

      const { labelIdentifierFieldMetadataUniversalIdentifier } =
        flatObjectMetadata;

      const displayableFlatFieldMetadatas =
        flatObjectMetadata.fieldUniversalIdentifiers
          .map(
            (fieldUniversalIdentifier) =>
              flatFieldMetadataMaps.byUniversalIdentifier[
                fieldUniversalIdentifier
              ],
          )
          .filter(isDefined)
          .filter((flatFieldMetadata) =>
            isFlatFieldMetadataDisplayableInDefaultView({
              flatFieldMetadata,
              labelIdentifierFieldMetadataUniversalIdentifier,
            }),
          );

      // The label identifier view field must be strictly lowest and visible.
      const orderedDisplayableFlatFieldMetadatas = [
        ...displayableFlatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.universalIdentifier ===
            labelIdentifierFieldMetadataUniversalIdentifier,
        ),
        ...displayableFlatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.universalIdentifier !==
            labelIdentifierFieldMetadataUniversalIdentifier,
        ),
      ];

      const createdAt = new Date().toISOString();

      orderedDisplayableFlatFieldMetadatas.forEach(
        (flatFieldMetadata, position) => {
          // The view field belongs to the application of the DISPLAYED FIELD,
          // matching fieldIndexViewFieldOnCreate: it can differ from the
          // object's application (fields can be created on another
          // application object).
          const fieldApplicationUniversalIdentifier =
            flatFieldMetadata.applicationUniversalIdentifier;

          getApplicationBucket(
            fieldApplicationUniversalIdentifier,
          ).viewFieldsToCreate.push({
            universalIdentifier: getViewFieldUniversalIdentifier({
              applicationUniversalIdentifier:
                fieldApplicationUniversalIdentifier,
              viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
              fieldMetadataUniversalIdentifier:
                flatFieldMetadata.universalIdentifier,
            }),
            applicationUniversalIdentifier: fieldApplicationUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              flatFieldMetadata.universalIdentifier,
            viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
            viewFieldGroupUniversalIdentifier: null,
            isVisible: true,
            size: DEFAULT_VIEW_FIELD_SIZE,
            position,
            aggregateOperation: null,
            isActive: true,
            isSystemSideEffect: true,
            universalOverrides: null,
            createdAt,
            updatedAt: createdAt,
            deletedAt: null,
          });
        },
      );
    }

    return backfillOperationsByApplication;
  }

  // The pipeline is application-scoped, so the backfill runs one migration per
  // application and per metadata name, views first across every application:
  // a view field only depends on its parent view (and pre-existing fields), so
  // once all views are committed the view-field migrations are order-free —
  // including cross-application view fields (e.g. a workspace-custom field on
  // an app object).
  private async runBackfillMigrations({
    workspaceId,
    backfillOperationsByApplication,
  }: {
    workspaceId: string;
    backfillOperationsByApplication: BackfillOperationsByApplication;
  }): Promise<void> {
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
      { viewFieldsToCreate },
    ] of backfillOperationsByApplication.entries()) {
      if (viewFieldsToCreate.length === 0) {
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
    // Legacy path: the matrix is applied literally, without the metadata
    // side-effect engine. A backfill command replays a state the engine
    // convention already defines; expanding side effects here would couple its
    // output to whatever handlers are registered at upgrade time.
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
        `Failed to backfill engine INDEX view(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill engine INDEX view(s) for workspace ${workspaceId}`,
      );
    }
  }
}
