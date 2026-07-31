import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
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
    key?: null;
  };
};

type FlatViewFromMaps = NonNullable<
  AllFlatEntityMaps['flatViewMaps']['byUniversalIdentifier'][string]
>;

type FlatViewFieldFromMaps = NonNullable<
  AllFlatEntityMaps['flatViewFieldMaps']['byUniversalIdentifier'][string]
>;

// Outcome of trying to claim a derived universal identifier for an entity:
// the unique index on (workspaceId, universalIdentifier) is not partial on
// deletedAt, so the identifier may already be reserved by another row.
type DerivedIdentifierClaim<TFlatEntity> =
  | { outcome: 'alreadyOwned' }
  | { outcome: 'claimable'; tombstoneReleaseUpdate?: ReownUpdate }
  | { outcome: 'heldByActiveEntity'; occupyingFlatEntity: TFlatEntity }
  | { outcome: 'unreleasable'; occupyingFlatEntity: TFlatEntity }
  | { outcome: 'alreadyClaimed' };

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

    const { viewUpdates, viewFieldUpdates } = this.computeReownUpdates({
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
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${viewUpdates.length} INDEX view(s) and ${viewFieldUpdates.length} view field(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

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

    await invalidateIndexViewReconcileCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });

    this.logger.log(
      `Reconciled ${viewUpdates.length} INDEX view(s) and ${viewFieldUpdates.length} view field(s) for workspace ${workspaceId}`,
    );
  }

  private computeReownUpdates({
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
  }): { viewUpdates: ReownUpdate[]; viewFieldUpdates: ReownUpdate[] } {
    const viewUpdates: ReownUpdate[] = [];
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

      const { updates, shouldReownViewFields } = this.computeViewReownUpdates({
        workspaceId,
        flatView,
        derivedViewUniversalIdentifier,
        flatViewMaps,
        claimedViewUniversalIdentifiers,
      });

      viewUpdates.push(...updates);

      if (!shouldReownViewFields) {
        continue;
      }

      viewFieldUpdates.push(
        ...this.computeViewFieldReownUpdates({
          workspaceId,
          flatView,
          derivedViewUniversalIdentifier,
          flatViewFieldMaps,
          flatFieldMetadataMaps,
          claimedViewFieldUniversalIdentifiers,
        }),
      );
    }

    return { viewUpdates, viewFieldUpdates };
  }

  // View fields are only re-owned when the view itself converges onto the
  // derived identifier: a demoted or skipped duplicate keeps its view fields
  // untouched, so they cannot collide with the canonical view's derived view
  // field identifiers.
  private computeViewReownUpdates({
    workspaceId,
    flatView,
    derivedViewUniversalIdentifier,
    flatViewMaps,
    claimedViewUniversalIdentifiers,
  }: {
    workspaceId: string;
    flatView: FlatViewFromMaps;
    derivedViewUniversalIdentifier: string;
    flatViewMaps: AllFlatEntityMaps['flatViewMaps'];
    claimedViewUniversalIdentifiers: Set<string>;
  }): { updates: ReownUpdate[]; shouldReownViewFields: boolean } {
    const claim = this.resolveDerivedIdentifierClaim({
      flatEntity: flatView,
      derivedUniversalIdentifier: derivedViewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
      claimedUniversalIdentifiers: claimedViewUniversalIdentifiers,
    });

    switch (claim.outcome) {
      case 'alreadyOwned':
        return {
          updates: flatView.isSystemSideEffect
            ? []
            : [{ id: flatView.id, update: { isSystemSideEffect: true } }],
          shouldReownViewFields: true,
        };
      case 'claimable':
        return {
          updates: [
            ...(isDefined(claim.tombstoneReleaseUpdate)
              ? [claim.tombstoneReleaseUpdate]
              : []),
            {
              id: flatView.id,
              update: this.buildClaimUpdate({
                flatEntity: flatView,
                derivedUniversalIdentifier: derivedViewUniversalIdentifier,
              }),
            },
          ],
          shouldReownViewFields: true,
        };
      case 'heldByActiveEntity': {
        const isDuplicateIndexViewOfSameObject =
          claim.occupyingFlatEntity.key === ViewKey.INDEX &&
          claim.occupyingFlatEntity.objectMetadataUniversalIdentifier ===
            flatView.objectMetadataUniversalIdentifier;

        if (!isDuplicateIndexViewOfSameObject) {
          this.logger.warn(
            `Derived identifier ${derivedViewUniversalIdentifier} of INDEX view ${flatView.id} is held by unrelated active view ${claim.occupyingFlatEntity.id} in workspace ${workspaceId}, skipping`,
          );

          return { updates: [], shouldReownViewFields: false };
        }

        this.logger.warn(
          `INDEX view ${flatView.id} duplicates INDEX view ${claim.occupyingFlatEntity.id} already holding ${derivedViewUniversalIdentifier} in workspace ${workspaceId}, demoting it`,
        );

        return {
          updates: [{ id: flatView.id, update: { key: null } }],
          shouldReownViewFields: false,
        };
      }
      case 'alreadyClaimed':
        this.logger.warn(
          `INDEX view ${flatView.id} duplicates another INDEX view already reconciled onto ${derivedViewUniversalIdentifier} in workspace ${workspaceId}, demoting it`,
        );

        return {
          updates: [{ id: flatView.id, update: { key: null } }],
          shouldReownViewFields: false,
        };
      case 'unreleasable':
        this.logger.warn(
          `Cannot release derived identifier ${derivedViewUniversalIdentifier} from soft-deleted view ${claim.occupyingFlatEntity.id} in workspace ${workspaceId}, skipping INDEX view ${flatView.id}`,
        );

        return { updates: [], shouldReownViewFields: false };
    }
  }

  private computeViewFieldReownUpdates({
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
  }): ReownUpdate[] {
    const flatViewFields =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
        flatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
      });

    return flatViewFields.flatMap((flatViewField) => {
      if (isDefined(flatViewField.deletedAt)) {
        return [];
      }

      const flatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[
          flatViewField.fieldMetadataUniversalIdentifier
        ];

      if (!isDefined(flatFieldMetadata)) {
        this.logger.warn(
          `Missing field for INDEX view field ${flatViewField.id} in workspace ${workspaceId}, skipping`,
        );

        return [];
      }

      const derivedViewFieldUniversalIdentifier =
        getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          viewUniversalIdentifier: derivedViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
        });

      return this.computeSingleViewFieldReownUpdates({
        workspaceId,
        flatViewField,
        derivedViewFieldUniversalIdentifier,
        flatViewFieldMaps,
        claimedViewFieldUniversalIdentifiers,
      });
    });
  }

  private computeSingleViewFieldReownUpdates({
    workspaceId,
    flatViewField,
    derivedViewFieldUniversalIdentifier,
    flatViewFieldMaps,
    claimedViewFieldUniversalIdentifiers,
  }: {
    workspaceId: string;
    flatViewField: FlatViewFieldFromMaps;
    derivedViewFieldUniversalIdentifier: string;
    flatViewFieldMaps: AllFlatEntityMaps['flatViewFieldMaps'];
    claimedViewFieldUniversalIdentifiers: Set<string>;
  }): ReownUpdate[] {
    const claim = this.resolveDerivedIdentifierClaim({
      flatEntity: flatViewField,
      derivedUniversalIdentifier: derivedViewFieldUniversalIdentifier,
      flatEntityMaps: flatViewFieldMaps,
      claimedUniversalIdentifiers: claimedViewFieldUniversalIdentifiers,
    });

    switch (claim.outcome) {
      case 'alreadyOwned':
        return flatViewField.isSystemSideEffect
          ? []
          : [{ id: flatViewField.id, update: { isSystemSideEffect: true } }];
      case 'claimable':
        return [
          ...(isDefined(claim.tombstoneReleaseUpdate)
            ? [claim.tombstoneReleaseUpdate]
            : []),
          {
            id: flatViewField.id,
            update: this.buildClaimUpdate({
              flatEntity: flatViewField,
              derivedUniversalIdentifier: derivedViewFieldUniversalIdentifier,
            }),
          },
        ];
      case 'heldByActiveEntity':
        this.logger.warn(
          `Derived identifier ${derivedViewFieldUniversalIdentifier} of view field ${flatViewField.id} is held by active view field ${claim.occupyingFlatEntity.id} in workspace ${workspaceId}, skipping`,
        );

        return [];
      case 'alreadyClaimed':
        this.logger.warn(
          `View field ${flatViewField.id} duplicates another view field already reconciled onto ${derivedViewFieldUniversalIdentifier} in workspace ${workspaceId}, skipping`,
        );

        return [];
      case 'unreleasable':
        this.logger.warn(
          `Cannot release derived identifier ${derivedViewFieldUniversalIdentifier} from soft-deleted view field ${claim.occupyingFlatEntity.id} in workspace ${workspaceId}, skipping view field ${flatViewField.id}`,
        );

        return [];
    }
  }

  // Resolves whether the derived identifier can be written for the entity and
  // registers successful claims (including released tombstone identifiers) in
  // claimedUniversalIdentifiers, so two entities deriving the same identifier
  // in one run cannot both claim it.
  private resolveDerivedIdentifierClaim<
    TFlatEntity extends {
      id: string;
      universalIdentifier: string;
      deletedAt: string | Date | null;
    },
  >({
    flatEntity,
    derivedUniversalIdentifier,
    flatEntityMaps,
    claimedUniversalIdentifiers,
  }: {
    flatEntity: TFlatEntity;
    derivedUniversalIdentifier: string;
    flatEntityMaps: {
      byUniversalIdentifier: Partial<Record<string, TFlatEntity>>;
    };
    claimedUniversalIdentifiers: Set<string>;
  }): DerivedIdentifierClaim<TFlatEntity> {
    if (flatEntity.universalIdentifier === derivedUniversalIdentifier) {
      claimedUniversalIdentifiers.add(derivedUniversalIdentifier);

      return { outcome: 'alreadyOwned' };
    }

    const occupyingFlatEntity =
      flatEntityMaps.byUniversalIdentifier[derivedUniversalIdentifier];

    if (
      isDefined(occupyingFlatEntity) &&
      !isDefined(occupyingFlatEntity.deletedAt)
    ) {
      return { outcome: 'heldByActiveEntity', occupyingFlatEntity };
    }

    if (isDefined(occupyingFlatEntity)) {
      // A soft-deleted entity still reserves the derived identifier: the
      // unique index is not partial on deletedAt. Moving the tombstone onto
      // its own primary key frees the identifier.
      const releasedUniversalIdentifier = occupyingFlatEntity.id;

      if (
        isDefined(
          flatEntityMaps.byUniversalIdentifier[releasedUniversalIdentifier],
        ) ||
        claimedUniversalIdentifiers.has(releasedUniversalIdentifier)
      ) {
        return { outcome: 'unreleasable', occupyingFlatEntity };
      }

      claimedUniversalIdentifiers.add(releasedUniversalIdentifier);
      claimedUniversalIdentifiers.add(derivedUniversalIdentifier);

      return {
        outcome: 'claimable',
        tombstoneReleaseUpdate: {
          id: occupyingFlatEntity.id,
          update: { universalIdentifier: releasedUniversalIdentifier },
        },
      };
    }

    if (claimedUniversalIdentifiers.has(derivedUniversalIdentifier)) {
      return { outcome: 'alreadyClaimed' };
    }

    claimedUniversalIdentifiers.add(derivedUniversalIdentifier);

    return { outcome: 'claimable' };
  }

  private buildClaimUpdate({
    flatEntity,
    derivedUniversalIdentifier,
  }: {
    flatEntity: { isSystemSideEffect: boolean };
    derivedUniversalIdentifier: string;
  }): ReownUpdate['update'] {
    return {
      universalIdentifier: derivedUniversalIdentifier,
      ...(flatEntity.isSystemSideEffect ? {} : { isSystemSideEffect: true }),
    };
  }
}
