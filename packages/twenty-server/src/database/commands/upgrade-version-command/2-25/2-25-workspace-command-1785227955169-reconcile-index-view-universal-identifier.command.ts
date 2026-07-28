import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { computeFlatIndexViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-index-view-to-create.util';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type ViewUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
    key?: null;
  };
};

type ViewFieldUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
  };
};

type BackfillOperationsByApplication = Map<
  string,
  {
    viewsToCreate: UniversalFlatView[];
    viewFieldsToCreate: UniversalFlatViewField[];
  }
>;

@RegisteredWorkspaceCommand('2.25.0', 1785227955169)
@Command({
  name: 'upgrade:2-25:reconcile-index-view-universal-identifier',
  description:
    'Make every object hold exactly one engine-owned INDEX table view ("All {objectLabelPlural}", keyed on ViewKey.INDEX). INDEX views authored by the twenty-standard and workspace-custom applications are re-owned: the view gets the name-free deterministic universal identifier (getSystemViewUniversalIdentifier, keyed on the object identifier + the INDEX key), each of its view fields gets the derived getViewFieldUniversalIdentifier — whatever application authored it, so an app column on a standard INDEX view converges too — and both get isSystemSideEffect: true, as if provisioned by the metadata side-effect engine. INDEX views authored by any other application are demoted to key: null (they become plain additional views under their manifest-declared identifier; the flat view validator rejects caller-provided INDEX keys from now on, so a later app sync cannot promote them back). Objects left without an INDEX view — external-app objects after demotion — get the engine-owned INDEX view and its full view-field layout backfilled through the workspace migration pipeline, converging upgraded installs with fresh installs. Children (view fields, filters, sorts, groups) reference the view by id, so re-owning universalIdentifier is a lossless update.',
})
export class ReconcileIndexViewUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
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
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
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

    const viewUpdates: ViewUpdate[] = [];
    const viewFieldUpdates: ViewFieldUpdate[] = [];
    // Objects whose engine-owned INDEX view exists (being re-owned in place);
    // every other object gets one backfilled below.
    const objectUniversalIdentifiersWithEngineIndexView = new Set<string>();

    for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
      if (
        !isDefined(flatView) ||
        flatView.key !== ViewKey.INDEX ||
        isDefined(flatView.deletedAt)
      ) {
        continue;
      }

      // An INDEX view authored by an external application is demoted to a
      // plain additional view: the engine is the sole owner of the INDEX key,
      // and the backfill below provisions the engine-owned INDEX view for the
      // object. The flat view validator rejects caller-provided INDEX keys, so
      // a later app sync cannot promote the demoted view back.
      if (
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatView.applicationUniversalIdentifier,
        )
      ) {
        viewUpdates.push({ id: flatView.id, update: { key: null } });
        continue;
      }

      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          flatView.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Missing object for INDEX view ${flatView.id} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      objectUniversalIdentifiersWithEngineIndexView.add(
        flatObjectMetadata.universalIdentifier,
      );

      const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        viewKey: ViewKey.INDEX,
      });

      const viewUpdate: ViewUpdate['update'] = {};

      if (flatView.universalIdentifier !== derivedViewUniversalIdentifier) {
        viewUpdate.universalIdentifier = derivedViewUniversalIdentifier;
      }
      if (!flatView.isSystemSideEffect) {
        viewUpdate.isSystemSideEffect = true;
      }

      if (Object.keys(viewUpdate).length > 0) {
        viewUpdates.push({ id: flatView.id, update: viewUpdate });
      }

      const flatViewFields =
        findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
          flatEntityMaps: flatViewFieldMaps,
          universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
        });

      for (const flatViewField of flatViewFields) {
        if (isDefined(flatViewField.deletedAt)) {
          continue;
        }

        // A view field belongs to the application of the field it displays, not
        // to its object's one: a custom field on a standard object yields a
        // custom-application view field on the standard INDEX view.
        const derivedViewFieldUniversalIdentifier =
          getViewFieldUniversalIdentifier({
            applicationUniversalIdentifier:
              flatViewField.applicationUniversalIdentifier,
            viewUniversalIdentifier: derivedViewUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              flatViewField.fieldMetadataUniversalIdentifier,
          });

        const viewFieldUpdate: ViewFieldUpdate['update'] = {};

        if (
          flatViewField.universalIdentifier !==
          derivedViewFieldUniversalIdentifier
        ) {
          viewFieldUpdate.universalIdentifier =
            derivedViewFieldUniversalIdentifier;
        }
        if (!flatViewField.isSystemSideEffect) {
          viewFieldUpdate.isSystemSideEffect = true;
        }

        if (Object.keys(viewFieldUpdate).length > 0) {
          viewFieldUpdates.push({
            id: flatViewField.id,
            update: viewFieldUpdate,
          });
        }
      }
    }

    const backfillOperationsByApplication =
      this.computeBackfillOperationsByApplication({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectUniversalIdentifiersWithEngineIndexView,
      });

    const backfillViewCount = [
      ...backfillOperationsByApplication.values(),
    ].reduce((count, { viewsToCreate }) => count + viewsToCreate.length, 0);

    if (
      viewUpdates.length === 0 &&
      viewFieldUpdates.length === 0 &&
      backfillViewCount === 0
    ) {
      this.logger.log(`No INDEX view to reconcile for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${viewUpdates.length} INDEX view(s), ${viewFieldUpdates.length} view field(s) and backfilling ${backfillViewCount} engine INDEX view(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    if (viewUpdates.length > 0 || viewFieldUpdates.length > 0) {
      // Single transaction per workspace: a partial backfill would leave a view
      // and its view fields on mismatched universal identifiers.
      await this.viewRepository.manager.transaction(async (entityManager) => {
        const transactionalViewRepository =
          entityManager.getRepository(ViewEntity);
        const transactionalViewFieldRepository =
          entityManager.getRepository(ViewFieldEntity);

        for (const { id, update } of viewUpdates) {
          await transactionalViewRepository.update({ id, workspaceId }, update);
        }

        for (const { id, update } of viewFieldUpdates) {
          await transactionalViewFieldRepository.update(
            { id, workspaceId },
            update,
          );
        }
      });

      const reconciledMetadataRelatedNames = [
        'view',
        ...getMetadataRelatedMetadataNames('view'),
        'viewField',
        ...getMetadataRelatedMetadataNames('viewField'),
        'pageLayoutWidget',
      ] as const;
      const allFlatEntityMapsKeys = [
        ...new Set(
          reconciledMetadataRelatedNames.map(getMetadataFlatEntityMapsKey),
        ),
      ];

      await this.workspaceMigrationRunnerService.invalidateCache({
        allFlatEntityMapsKeys,
        workspaceId,
      });
    }

    await this.runBackfillMigrations({
      workspaceId,
      backfillOperationsByApplication,
    });

    this.logger.log(
      `Reconciled ${viewUpdates.length} INDEX view(s), ${viewFieldUpdates.length} view field(s) and backfilled ${backfillViewCount} engine INDEX view(s) for workspace ${workspaceId}`,
    );
  }

  // Engine INDEX views for objects that have none: external-app objects after
  // demotion, and objects that lost theirs. Full default layout, mirroring
  // what objectSystemFieldsAndIndexViewOnCreate emits at object creation.
  private computeBackfillOperationsByApplication({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectUniversalIdentifiersWithEngineIndexView,
  }: {
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
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
          // The view field belongs to the application of the field it
          // displays, matching fieldIndexViewFieldOnCreate.
          const viewFieldApplicationUniversalIdentifier =
            flatFieldMetadata.applicationUniversalIdentifier;

          getApplicationBucket(
            viewFieldApplicationUniversalIdentifier,
          ).viewFieldsToCreate.push({
            universalIdentifier: getViewFieldUniversalIdentifier({
              applicationUniversalIdentifier:
                viewFieldApplicationUniversalIdentifier,
              viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
              fieldMetadataUniversalIdentifier:
                flatFieldMetadata.universalIdentifier,
            }),
            applicationUniversalIdentifier:
              viewFieldApplicationUniversalIdentifier,
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

  private async runBackfillMigrations({
    workspaceId,
    backfillOperationsByApplication,
  }: {
    workspaceId: string;
    backfillOperationsByApplication: BackfillOperationsByApplication;
  }): Promise<void> {
    // One migration per application (the pipeline is application-scoped).
    // Applications owning views run first so a cross-application view field
    // (e.g. a workspace-custom field on an app object) finds its parent view.
    const orderedApplicationEntries = [
      ...backfillOperationsByApplication.entries(),
    ].sort(
      ([, aBucket], [, bBucket]) =>
        bBucket.viewsToCreate.length - aBucket.viewsToCreate.length,
    );

    for (const [
      applicationUniversalIdentifier,
      { viewsToCreate, viewFieldsToCreate },
    ] of orderedApplicationEntries) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
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
          `Failed to backfill engine INDEX view(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );

        throw new Error(
          `Failed to backfill engine INDEX view(s) for workspace ${workspaceId}`,
        );
      }
    }
  }
}
