import { Command } from 'nest-commander';
import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildObjectNavigationUniversalFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

@RegisteredWorkspaceCommand('2.38.0', 1788181550000)
@Command({
  name: 'upgrade:2-38:provision-missing-object-navigation-command-menu-items',
  description:
    'Provision the navigation command menu item of every object that has none. Objects installed through an application manifest never got one: objectNavigationCommandOnCreate noops on that path because the manifest mints entity ids after side-effect expansion and the NAVIGATION payload needs the object id (the dual write tracked by core-team-issues#2794). Scoped to application-installed objects: twenty-standard seeds its own through the from/to sync it owns, and workspace-custom objects go through the API path where the create handler already provisions. Mints exactly what the create handler mints, under the application owning the object, one migration per application, with isActive mirroring the object so an inactive object gets a disabled command. Skips any object that already has a command menu item targeting it, so it is idempotent and leaves rows the 2-38 re-own could not converge alone. Runs after that re-own so a converged row is recognised by its derived identifier.',
})
export class ProvisionMissingObjectNavigationCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatCommandMenuItemsToCreateByApplication =
      this.computeFlatCommandMenuItemsToCreateByApplication({
        flatCommandMenuItemMaps,
        flatObjectMetadataMaps,
        excludedApplicationUniversalIdentifiers: new Set([
          twentyStandardFlatApplication.universalIdentifier,
          workspaceCustomFlatApplication.universalIdentifier,
        ]),
      });

    if (flatCommandMenuItemsToCreateByApplication.size === 0) {
      this.logger.log(
        `Every object already has a navigation command menu item in workspace ${workspaceId}`,
      );

      return;
    }

    const totalCount = [
      ...flatCommandMenuItemsToCreateByApplication.values(),
    ].reduce((count, flatCommandMenuItems) => count + flatCommandMenuItems.length, 0);

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Provisioning ${totalCount} missing object navigation command menu item(s) across ${flatCommandMenuItemsToCreateByApplication.size} application(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const [
      applicationUniversalIdentifier,
      flatCommandMenuItemsToCreate,
    ] of flatCommandMenuItemsToCreateByApplication) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              commandMenuItem: {
                flatEntityToCreate: flatCommandMenuItemsToCreate,
                flatEntityToUpdate: [],
                flatEntityToDelete: [],
              },
            } as never,
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to provision navigation command menu item(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );

        throw new Error(
          `Failed to provision navigation command menu item(s) for workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Provisioned ${totalCount} object navigation command menu item(s) for workspace ${workspaceId}`,
    );
  }

  private computeFlatCommandMenuItemsToCreateByApplication({
    flatCommandMenuItemMaps,
    flatObjectMetadataMaps,
    excludedApplicationUniversalIdentifiers,
  }: {
    flatCommandMenuItemMaps: AllFlatEntityMaps['flatCommandMenuItemMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    excludedApplicationUniversalIdentifiers: Set<string>;
  }): Map<string, UniversalFlatCommandMenuItem[]> {
    const flatCommandMenuItemsToCreateByApplication = new Map<
      string,
      UniversalFlatCommandMenuItem[]
    >();

    const maxPosition = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .reduce(
        (max, flatCommandMenuItem) =>
          Math.max(max, flatCommandMenuItem.position),
        -1,
      );

    let nextPosition = maxPosition + 1;
    const now = new Date().toISOString();

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatObjectMetadata) ||
        excludedApplicationUniversalIdentifiers.has(
          flatObjectMetadata.applicationUniversalIdentifier,
        )
      ) {
        continue;
      }

      const objectAlreadyHasNavigationCommandMenuItem =
        flatObjectMetadata.commandMenuItemUniversalIdentifiers.some(
          (universalIdentifier) =>
            isDefined(
              flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier],
            ),
        );

      const derivedUniversalIdentifier =
        getSystemNavigationCommandMenuItemUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        });

      if (
        objectAlreadyHasNavigationCommandMenuItem ||
        isDefined(
          flatCommandMenuItemMaps.byUniversalIdentifier[
            derivedUniversalIdentifier
          ],
        )
      ) {
        continue;
      }

      const flatCommandMenuItemToCreate =
        buildObjectNavigationUniversalFlatCommandMenuItem({
          objectMetadata: {
            id: flatObjectMetadata.id,
            universalIdentifier: flatObjectMetadata.universalIdentifier,
            nameSingular: flatObjectMetadata.nameSingular,
            shortcut: flatObjectMetadata.shortcut,
            isActive: flatObjectMetadata.isActive,
          },
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          position: nextPosition++,
          now,
        });

      const existing =
        flatCommandMenuItemsToCreateByApplication.get(
          flatObjectMetadata.applicationUniversalIdentifier,
        ) ?? [];

      existing.push(flatCommandMenuItemToCreate);
      flatCommandMenuItemsToCreateByApplication.set(
        flatObjectMetadata.applicationUniversalIdentifier,
        existing,
      );
    }

    return flatCommandMenuItemsToCreateByApplication;
  }
}
