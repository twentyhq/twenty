import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateIndexViewReconcileCache } from 'src/database/commands/upgrade-version-command/2-26/utils/invalidate-index-view-reconcile-cache.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type ReownUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
  };
};

type ReownPlan = {
  viewIdsToDelete: string[];
  viewUpdates: ReownUpdate[];
  viewFieldIdsToDelete: string[];
  viewFieldUpdates: ReownUpdate[];
};

type FlatViewFromMaps = NonNullable<
  AllFlatEntityMaps['flatViewMaps']['byUniversalIdentifier'][string]
>;

@RegisteredWorkspaceCommand('2.26.0', 1785255689000)
@Command({
  name: 'upgrade:2-26:reconcile-index-view-universal-identifier',
  description:
    'Re-own the INDEX table views ("All {objectLabelPlural}", keyed on ViewKey.INDEX) of the twenty-standard and workspace-custom applications, and all their view fields, onto the engine convention: the view gets the name-free deterministic universal identifier (getSystemViewUniversalIdentifier, object identifier + INDEX key), each view field gets the derived getSystemViewFieldUniversalIdentifier keyed on the application of the field it DISPLAYS — not the row attribution, which diverges when a user shows a hidden standard column and mints a workspace-custom view field on a standard field — so an app or user column on a standard INDEX view converges too, and both get isSystemSideEffect: true, as if provisioned by the metadata side-effect engine. INDEX views of other applications are handled by the demote-and-backfill command. Children reference the view by primary key, so the re-own is a lossless update.',
})
export class ReconcileIndexViewUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
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

    const flatIndexViews = Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatView) =>
          flatView.key === ViewKey.INDEX &&
          !isDefined(flatView.deletedAt) &&
          engineOwnedApplicationUniversalIdentifiers.has(
            flatView.applicationUniversalIdentifier,
          ),
      );

    const {
      viewIdsToDelete,
      viewUpdates,
      viewFieldIdsToDelete,
      viewFieldUpdates,
    } = this.computeReownPlan({
      workspaceId,
      flatIndexViews,
      flatViewMaps,
      flatViewFieldMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (viewUpdates.length === 0 && viewFieldUpdates.length === 0) {
      this.logger.log(
        `No INDEX view to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${viewUpdates.length} INDEX view(s) and ${viewFieldUpdates.length} view field(s), deleting ${viewIdsToDelete.length} soft-deleted view(s) and ${viewFieldIdsToDelete.length} soft-deleted view field(s) holding reconciled identifiers, for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.viewRepository.manager.transaction(async (entityManager) => {
      const transactionalViewRepository =
        entityManager.getRepository(ViewEntity);
      const transactionalViewFieldRepository =
        entityManager.getRepository(ViewFieldEntity);

      // Soft-deleted holders are removed first to free their identifiers:
      // the unique index on (workspaceId, universalIdentifier) is not
      // partial on deletedAt.
      if (viewIdsToDelete.length > 0) {
        await transactionalViewRepository.delete({
          id: In(viewIdsToDelete),
          workspaceId,
        });
      }

      for (const { id, update } of viewUpdates) {
        await transactionalViewRepository.update({ id, workspaceId }, update);
      }

      if (viewFieldIdsToDelete.length > 0) {
        await transactionalViewFieldRepository.delete({
          id: In(viewFieldIdsToDelete),
          workspaceId,
        });
      }

      for (const { id, update } of viewFieldUpdates) {
        await transactionalViewFieldRepository.update(
          { id, workspaceId },
          update,
        );
      }
    });

    await invalidateIndexViewReconcileCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });

    this.logger.log(
      `Reconciled ${viewUpdates.length} INDEX view(s) and ${viewFieldUpdates.length} view field(s) for workspace ${workspaceId}`,
    );
  }

  private computeReownPlan({
    workspaceId,
    flatIndexViews,
    flatViewMaps,
    flatViewFieldMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    flatIndexViews: FlatViewFromMaps[];
    flatViewMaps: AllFlatEntityMaps['flatViewMaps'];
    flatViewFieldMaps: AllFlatEntityMaps['flatViewFieldMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): ReownPlan {
    const viewIdsToDelete: string[] = [];
    const viewUpdates: ReownUpdate[] = [];
    const viewFieldIdsToDelete: string[] = [];
    const viewFieldUpdates: ReownUpdate[] = [];
    const claimedViewUniversalIdentifiers = new Set<string>();
    const claimedViewFieldUniversalIdentifiers = new Set<string>();

    for (const flatView of flatIndexViews) {
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

      const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        viewKey: ViewKey.INDEX,
      });

      if (flatView.universalIdentifier === derivedViewUniversalIdentifier) {
        claimedViewUniversalIdentifiers.add(derivedViewUniversalIdentifier);

        if (!flatView.isSystemSideEffect) {
          viewUpdates.push({
            id: flatView.id,
            update: { isSystemSideEffect: true },
          });
        }
      } else {
        const occupyingFlatView =
          flatViewMaps.byUniversalIdentifier[derivedViewUniversalIdentifier];
        const isHeldByActiveView =
          isDefined(occupyingFlatView) &&
          !isDefined(occupyingFlatView.deletedAt);

        if (
          isHeldByActiveView ||
          claimedViewUniversalIdentifiers.has(derivedViewUniversalIdentifier)
        ) {
          this.logger.warn(
            `Derived identifier ${derivedViewUniversalIdentifier} of INDEX view ${flatView.id} is already held by another active view in workspace ${workspaceId}, skipping`,
          );
          continue;
        }

        if (isDefined(occupyingFlatView)) {
          // The soft-deleted holder cannot be restored and only blocks the
          // identifier: delete it.
          viewIdsToDelete.push(occupyingFlatView.id);
        }

        claimedViewUniversalIdentifiers.add(derivedViewUniversalIdentifier);

        const update: ReownUpdate['update'] = {
          universalIdentifier: derivedViewUniversalIdentifier,
        };

        if (!flatView.isSystemSideEffect) {
          update.isSystemSideEffect = true;
        }

        viewUpdates.push({ id: flatView.id, update });
      }

      const viewFieldReownPlan = this.computeViewFieldReownPlan({
        workspaceId,
        flatView,
        derivedViewUniversalIdentifier,
        flatViewFieldMaps,
        flatFieldMetadataMaps,
        claimedViewFieldUniversalIdentifiers,
      });

      viewFieldIdsToDelete.push(...viewFieldReownPlan.viewFieldIdsToDelete);
      viewFieldUpdates.push(...viewFieldReownPlan.viewFieldUpdates);
    }

    return {
      viewIdsToDelete,
      viewUpdates,
      viewFieldIdsToDelete,
      viewFieldUpdates,
    };
  }

  private computeViewFieldReownPlan({
    workspaceId,
    flatView,
    derivedViewUniversalIdentifier,
    flatViewFieldMaps,
    flatFieldMetadataMaps,
    claimedViewFieldUniversalIdentifiers,
  }: {
    workspaceId: string;
    flatView: FlatViewFromMaps;
    derivedViewUniversalIdentifier: string;
    flatViewFieldMaps: AllFlatEntityMaps['flatViewFieldMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
    claimedViewFieldUniversalIdentifiers: Set<string>;
  }): Pick<ReownPlan, 'viewFieldIdsToDelete' | 'viewFieldUpdates'> {
    const viewFieldIdsToDelete: string[] = [];
    const viewFieldUpdates: ReownUpdate[] = [];

    const flatViewFields =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
        flatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
      });

    for (const flatViewField of flatViewFields) {
      if (isDefined(flatViewField.deletedAt)) {
        continue;
      }

      const flatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[
          flatViewField.fieldMetadataUniversalIdentifier
        ];

      if (!isDefined(flatFieldMetadata)) {
        this.logger.warn(
          `Missing field for INDEX view field ${flatViewField.id} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const derivedViewFieldUniversalIdentifier =
        getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          viewUniversalIdentifier: derivedViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
        });

      if (
        flatViewField.universalIdentifier ===
        derivedViewFieldUniversalIdentifier
      ) {
        claimedViewFieldUniversalIdentifiers.add(
          derivedViewFieldUniversalIdentifier,
        );

        if (!flatViewField.isSystemSideEffect) {
          viewFieldUpdates.push({
            id: flatViewField.id,
            update: { isSystemSideEffect: true },
          });
        }
        continue;
      }

      const occupyingFlatViewField =
        flatViewFieldMaps.byUniversalIdentifier[
          derivedViewFieldUniversalIdentifier
        ];
      const isHeldByActiveViewField =
        isDefined(occupyingFlatViewField) &&
        !isDefined(occupyingFlatViewField.deletedAt);

      if (
        isHeldByActiveViewField ||
        claimedViewFieldUniversalIdentifiers.has(
          derivedViewFieldUniversalIdentifier,
        )
      ) {
        this.logger.warn(
          `Derived identifier ${derivedViewFieldUniversalIdentifier} of view field ${flatViewField.id} is already held by another active view field in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      if (isDefined(occupyingFlatViewField)) {
        viewFieldIdsToDelete.push(occupyingFlatViewField.id);
      }

      claimedViewFieldUniversalIdentifiers.add(
        derivedViewFieldUniversalIdentifier,
      );

      const update: ReownUpdate['update'] = {
        universalIdentifier: derivedViewFieldUniversalIdentifier,
      };

      if (!flatViewField.isSystemSideEffect) {
        update.isSystemSideEffect = true;
      }

      viewFieldUpdates.push({ id: flatViewField.id, update });
    }

    return { viewFieldIdsToDelete, viewFieldUpdates };
  }
}
