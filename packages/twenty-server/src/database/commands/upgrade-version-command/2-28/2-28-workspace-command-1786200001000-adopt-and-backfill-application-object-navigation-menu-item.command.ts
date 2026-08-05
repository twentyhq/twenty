import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildObjectNavigationMenuItemReownOperations } from 'src/database/commands/upgrade-version-command/2-28/utils/build-object-navigation-menu-item-reown-operations.util';
import { invalidateNavigationMenuItemReconcileCache } from 'src/database/commands/upgrade-version-command/2-28/utils/invalidate-navigation-menu-item-reconcile-cache.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { computeFlatObjectNavigationMenuItemToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-object-navigation-menu-item-to-create.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.28.0', 1786200001000)
@Command({
  name: 'upgrade:2-28:adopt-and-backfill-application-object-navigation-menu-item',
  description:
    'Manifest-installed applications never had their OBJECT navigation menu item auto-provisioned: their objects have no sidebar row at all unless the app authored one itself, and the rows that do exist for them were minted next to the create-object input transpiler and attributed to the workspace custom application. The metadata side-effect engine is now the owner, so every workspace-level OBJECT item of an application object is adopted — derived universal identifier, isSystemSideEffect: true, re-attributed to the application owning the object — and every application object still left without one gets it backfilled through the workspace migration pipeline, appended after the last workspace-level item so the existing sidebar order is preserved. The backfill runs through the legacy pipeline path (no side-effect expansion: it replays a state the engine convention already defines) and is idempotent and retry-safe: adopted items are neither re-adopted nor re-backfilled, and an object whose derived identifier is already held by another row is left untouched.',
})
export class AdoptAndBackfillApplicationObjectNavigationMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(NavigationMenuItemEntity)
    private readonly navigationMenuItemRepository: Repository<NavigationMenuItemEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatNavigationMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const engineOwnedApplicationUniversalIdentifiers = new Set([
      twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomFlatApplication.universalIdentifier,
    ]);

    const {
      updates,
      claimedObjectUniversalIdentifiers,
      skippedObjectUniversalIdentifiers,
    } = buildObjectNavigationMenuItemReownOperations({
      flatNavigationMenuItemMaps,
      flatObjectMetadataMaps,
      isFlatObjectMetadataInScope: (flatObjectMetadata) =>
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatObjectMetadata.applicationUniversalIdentifier,
        ),
    });

    for (const objectUniversalIdentifier of skippedObjectUniversalIdentifiers) {
      this.logger.warn(
        `Derived navigation menu item identifier of object ${objectUniversalIdentifier} is already held by another item in workspace ${workspaceId}, skipping`,
      );
    }

    const flatNavigationMenuItemsToCreateByApplication =
      this.computeBackfillOperationsByApplication({
        flatNavigationMenuItemMaps,
        flatObjectMetadataMaps,
        engineOwnedApplicationUniversalIdentifiers,
        objectUniversalIdentifiersToSkip: new Set([
          ...claimedObjectUniversalIdentifiers,
          ...skippedObjectUniversalIdentifiers,
        ]),
      });

    const backfillCount = [
      ...flatNavigationMenuItemsToCreateByApplication.values(),
    ].reduce(
      (count, flatNavigationMenuItemsToCreate) =>
        count + flatNavigationMenuItemsToCreate.length,
      0,
    );

    if (updates.length === 0 && backfillCount === 0) {
      this.logger.log(
        `No application object navigation menu item to adopt or backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adopting ${updates.length} and backfilling ${backfillCount} application object navigation menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    if (updates.length > 0) {
      await this.navigationMenuItemRepository.manager.transaction(
        async (entityManager) => {
          const transactionalNavigationMenuItemRepository =
            entityManager.getRepository(NavigationMenuItemEntity);

          for (const { id, update } of updates) {
            await transactionalNavigationMenuItemRepository.update(
              { id, workspaceId },
              update,
            );
          }
        },
      );

      await invalidateNavigationMenuItemReconcileCache({
        workspaceId,
        workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
      });
    }

    await this.runBackfillMigrations({
      workspaceId,
      flatNavigationMenuItemsToCreateByApplication,
    });

    this.logger.log(
      `Adopted ${updates.length} and backfilled ${backfillCount} application object navigation menu item(s) for workspace ${workspaceId}`,
    );
  }

  private computeBackfillOperationsByApplication({
    flatNavigationMenuItemMaps,
    flatObjectMetadataMaps,
    engineOwnedApplicationUniversalIdentifiers,
    objectUniversalIdentifiersToSkip,
  }: {
    flatNavigationMenuItemMaps: AllFlatEntityMaps['flatNavigationMenuItemMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    engineOwnedApplicationUniversalIdentifiers: Set<string>;
    objectUniversalIdentifiersToSkip: Set<string>;
  }): Map<string, UniversalFlatNavigationMenuItem[]> {
    const workspaceLevelFlatNavigationMenuItems = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatNavigationMenuItem) =>
          !isDefined(flatNavigationMenuItem.userWorkspaceId),
      );

    let nextPosition =
      workspaceLevelFlatNavigationMenuItems.length > 0
        ? Math.max(
            ...workspaceLevelFlatNavigationMenuItems.map(
              (flatNavigationMenuItem) => flatNavigationMenuItem.position,
            ),
          ) + 1
        : 0;

    const flatNavigationMenuItemsToCreateByApplication = new Map<
      string,
      UniversalFlatNavigationMenuItem[]
    >();

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatObjectMetadata) ||
        engineOwnedApplicationUniversalIdentifiers.has(
          flatObjectMetadata.applicationUniversalIdentifier,
        ) ||
        objectUniversalIdentifiersToSkip.has(
          flatObjectMetadata.universalIdentifier,
        )
      ) {
        continue;
      }

      const { applicationUniversalIdentifier } = flatObjectMetadata;

      const flatNavigationMenuItemToCreate =
        computeFlatObjectNavigationMenuItemToCreate({
          objectMetadata: flatObjectMetadata,
          applicationUniversalIdentifier,
          position: nextPosition,
        });

      // Already backfilled by a previous (partially failed) run.
      if (
        isDefined(
          flatNavigationMenuItemMaps.byUniversalIdentifier[
            flatNavigationMenuItemToCreate.universalIdentifier
          ],
        )
      ) {
        continue;
      }

      nextPosition += 1;

      flatNavigationMenuItemsToCreateByApplication.set(
        applicationUniversalIdentifier,
        [
          ...(flatNavigationMenuItemsToCreateByApplication.get(
            applicationUniversalIdentifier,
          ) ?? []),
          flatNavigationMenuItemToCreate,
        ],
      );
    }

    return flatNavigationMenuItemsToCreateByApplication;
  }

  private async runBackfillMigrations({
    workspaceId,
    flatNavigationMenuItemsToCreateByApplication,
  }: {
    workspaceId: string;
    flatNavigationMenuItemsToCreateByApplication: Map<
      string,
      UniversalFlatNavigationMenuItem[]
    >;
  }): Promise<void> {
    for (const [
      applicationUniversalIdentifier,
      flatNavigationMenuItemsToCreate,
    ] of flatNavigationMenuItemsToCreateByApplication.entries()) {
      if (flatNavigationMenuItemsToCreate.length === 0) {
        continue;
      }

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              navigationMenuItem: {
                flatEntityToCreate: flatNavigationMenuItemsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to backfill object navigation menu item(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );

        throw new Error(
          `Failed to backfill object navigation menu item(s) for workspace ${workspaceId}`,
        );
      }
    }
  }
}
