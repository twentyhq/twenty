import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type EntityTarget, type ObjectLiteral, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  BACKFILLED_OVERRIDES_METADATA_NAMES,
  type BackfilledOverridesMetadataName,
} from 'src/database/commands/upgrade-version-command/2-40/constants/legacy-override-entry-property-names-by-metadata-name.constant';
import {
  type AuthoredOverridesBackfillUpdate,
  type BackfillableFlatEntity,
  computeAuthoredOverridesBackfillUpdate,
} from 'src/database/commands/upgrade-version-command/2-40/utils/compute-authored-overrides-backfill-update.util';
import { computeMirroredNavigationCommandMenuItemIds } from 'src/database/commands/upgrade-version-command/2-40/utils/compute-mirrored-navigation-command-menu-item-ids.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const ENTITY_BY_BACKFILLED_METADATA_NAME: Record<
  BackfilledOverridesMetadataName,
  EntityTarget<ObjectLiteral>
> = {
  objectMetadata: ObjectMetadataEntity,
  fieldMetadata: FieldMetadataEntity,
  view: ViewEntity,
  viewField: ViewFieldEntity,
  viewFieldGroup: ViewFieldGroupEntity,
  pageLayoutTab: PageLayoutTabEntity,
  pageLayoutWidget: PageLayoutWidgetEntity,
  commandMenuItem: CommandMenuItemEntity,
  timelineActivityType: TimelineActivityTypeEntity,
};

const BACKFILLED_FLAT_MAPS_KEYS = BACKFILLED_OVERRIDES_METADATA_NAMES.map(
  getMetadataFlatEntityMapsKey,
);

const INVALIDATED_FLAT_MAPS_KEYS = [
  ...new Set(
    BACKFILLED_OVERRIDES_METADATA_NAMES.flatMap((metadataName) => [
      metadataName,
      ...getMetadataRelatedMetadataNames(metadataName),
    ]).map(getMetadataFlatEntityMapsKey),
  ),
];

type BackfillableFlatEntityMaps = {
  byUniversalIdentifier: Partial<
    Record<string, BackfillableFlatEntity & { id: string }>
  >;
};

type BackfillRowUpdate = {
  metadataName: BackfilledOverridesMetadataName;
  id: string;
  update: AuthoredOverridesBackfillUpdate;
};

@RegisteredWorkspaceCommand('2.40.0', 1789057733650)
@Command({
  name: 'upgrade:2-40:backfill-authored-overrides',
  description:
    'Rewrite the overrides and universalOverrides blobs of the nine overridable kinds (object, field, view, viewField, viewFieldGroup, pageLayoutTab, pageLayoutWidget, commandMenuItem, timelineActivityType) under the author-keyed shape introduced in 2.39: a flat entry, written when the workspace custom application was the only author, lifts under that application universal identifier. A false isActive column on a row the custom application overrides rather than owns (any row of another application, and the engine-managed rows carrying its identifier) is a deactivation written when deactivations went to the column: it moves into the custom entry on both blobs and the column returns to the owner value, true, so a reset drops it with the entry. The navigation command of an inactive object keeps its false, which the engine mirrors from the object. Effective values are unchanged. Idempotent: a converged row yields no update.',
})
export class BackfillAuthoredOverridesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const workspaceCustomApplicationUniversalIdentifier =
      workspaceCustomFlatApplication.universalIdentifier;

    const allFlatEntityMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      BACKFILLED_FLAT_MAPS_KEYS,
    );

    const mirroredNavigationCommandMenuItemIds =
      computeMirroredNavigationCommandMenuItemIds({
        flatCommandMenuItemMaps: allFlatEntityMaps.flatCommandMenuItemMaps,
        flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
        workspaceCustomApplicationUniversalIdentifier,
      });

    const rowUpdates = BACKFILLED_OVERRIDES_METADATA_NAMES.flatMap(
      (metadataName) => {
        const flatEntityMaps = allFlatEntityMaps[
          getMetadataFlatEntityMapsKey(metadataName)
        ] as unknown as BackfillableFlatEntityMaps;

        return Object.values(flatEntityMaps.byUniversalIdentifier)
          .filter(isDefined)
          .flatMap((flatEntity): BackfillRowUpdate[] => {
            const update = computeAuthoredOverridesBackfillUpdate({
              metadataName,
              flatEntity,
              workspaceCustomApplicationUniversalIdentifier,
              isActiveEngineDerived:
                metadataName === 'commandMenuItem' &&
                mirroredNavigationCommandMenuItemIds.has(flatEntity.id),
            });

            return isDefined(update)
              ? [{ metadataName, id: flatEntity.id, update }]
              : [];
          });
      },
    );

    if (rowUpdates.length === 0) {
      this.logger.log(
        `No override blob to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${rowUpdates.length} override blob(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.objectMetadataRepository.manager.transaction(
      async (entityManager) => {
        for (const { metadataName, id, update } of rowUpdates) {
          await entityManager
            .getRepository(ENTITY_BY_BACKFILLED_METADATA_NAME[metadataName])
            .update({ id, workspaceId }, update);
        }
      },
    );

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: INVALIDATED_FLAT_MAPS_KEYS,
      workspaceId,
    });

    this.logger.log(
      `Backfilled ${rowUpdates.length} override blob(s) for workspace ${workspaceId}`,
    );
  }
}
