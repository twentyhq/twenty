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
  };
};

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
    flatViewFieldMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    flatIndexViews: NonNullable<
      AllFlatEntityMaps['flatViewMaps']['byUniversalIdentifier'][string]
    >[];
    flatViewFieldMaps: AllFlatEntityMaps['flatViewFieldMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): { viewUpdates: ReownUpdate[]; viewFieldUpdates: ReownUpdate[] } {
    const viewUpdates: ReownUpdate[] = [];
    const viewFieldUpdates: ReownUpdate[] = [];

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

      const viewUpdate = this.computeViewReownUpdate({
        flatView,
        derivedViewUniversalIdentifier,
      });

      if (isDefined(viewUpdate)) {
        viewUpdates.push(viewUpdate);
      }

      viewFieldUpdates.push(
        ...findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
          flatEntityMaps: flatViewFieldMaps,
          universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
        })
          .map((flatViewField) =>
            this.computeViewFieldReownUpdate({
              workspaceId,
              flatViewField,
              derivedViewUniversalIdentifier,
              flatFieldMetadataMaps,
            }),
          )
          .filter(isDefined),
      );
    }

    return { viewUpdates, viewFieldUpdates };
  }

  private computeViewReownUpdate({
    flatView,
    derivedViewUniversalIdentifier,
  }: {
    flatView: NonNullable<
      AllFlatEntityMaps['flatViewMaps']['byUniversalIdentifier'][string]
    >;
    derivedViewUniversalIdentifier: string;
  }): ReownUpdate | undefined {
    const update: ReownUpdate['update'] = {};

    if (flatView.universalIdentifier !== derivedViewUniversalIdentifier) {
      update.universalIdentifier = derivedViewUniversalIdentifier;
    }
    if (!flatView.isSystemSideEffect) {
      update.isSystemSideEffect = true;
    }

    if (Object.keys(update).length === 0) {
      return undefined;
    }

    return { id: flatView.id, update };
  }

  private computeViewFieldReownUpdate({
    workspaceId,
    flatViewField,
    derivedViewUniversalIdentifier,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    flatViewField: NonNullable<
      AllFlatEntityMaps['flatViewFieldMaps']['byUniversalIdentifier'][string]
    >;
    derivedViewUniversalIdentifier: string;
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): ReownUpdate | undefined {
    if (isDefined(flatViewField.deletedAt)) {
      return undefined;
    }

    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        flatViewField.fieldMetadataUniversalIdentifier
      ];

    if (!isDefined(flatFieldMetadata)) {
      this.logger.warn(
        `Missing field for INDEX view field ${flatViewField.id} in workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    const derivedViewFieldUniversalIdentifier =
      getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
        viewUniversalIdentifier: derivedViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          flatViewField.fieldMetadataUniversalIdentifier,
      });

    const update: ReownUpdate['update'] = {};

    if (
      flatViewField.universalIdentifier !== derivedViewFieldUniversalIdentifier
    ) {
      update.universalIdentifier = derivedViewFieldUniversalIdentifier;
    }
    if (!flatViewField.isSystemSideEffect) {
      update.isSystemSideEffect = true;
    }

    if (Object.keys(update).length === 0) {
      return undefined;
    }

    return { id: flatViewField.id, update };
  }
}
