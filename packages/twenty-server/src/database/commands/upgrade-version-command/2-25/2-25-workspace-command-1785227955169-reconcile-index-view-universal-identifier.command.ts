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
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type UniversalIdentifierUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
  };
};

@RegisteredWorkspaceCommand('2.25.0', 1785227955169)
@Command({
  name: 'upgrade:2-25:reconcile-index-view-universal-identifier',
  description:
    'Reconcile every default INDEX table view ("All {objectLabelPlural}", keyed on ViewKey.INDEX) and its view fields with the engine convention, for standard and custom objects alike. The view gets the name-free deterministic universal identifier (getSystemViewUniversalIdentifier, keyed on the object identifier + the INDEX key), each view field gets the derived getViewFieldUniversalIdentifier, and both get isSystemSideEffect: true — as if they had been provisioned by the metadata side-effect engine. Children (view fields, filters, sorts, groups) reference the view by id, so re-owning universalIdentifier is a lossless update.',
})
export class ReconcileIndexViewUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
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

    const { flatViewMaps, flatViewFieldMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatObjectMetadataMaps',
      ]);

    const viewUpdates: UniversalIdentifierUpdate[] = [];
    const viewFieldUpdates: UniversalIdentifierUpdate[] = [];

    for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
      if (
        !isDefined(flatView) ||
        flatView.key !== ViewKey.INDEX ||
        isDefined(flatView.deletedAt)
      ) {
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

      const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        viewKey: ViewKey.INDEX,
      });

      const viewUpdate: UniversalIdentifierUpdate['update'] = {};

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

        const viewFieldUpdate: UniversalIdentifierUpdate['update'] = {};

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

    this.logger.log(
      `Reconciled ${viewUpdates.length} INDEX view(s) and ${viewFieldUpdates.length} view field(s) for workspace ${workspaceId}`,
    );
  }
}
