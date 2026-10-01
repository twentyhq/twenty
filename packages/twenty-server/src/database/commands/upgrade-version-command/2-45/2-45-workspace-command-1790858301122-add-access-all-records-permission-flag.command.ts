import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildStandardFlatPermissionFlagMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag/build-standard-flat-permission-flag-metadata-maps.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER =
  SystemPermissionFlag[PermissionFlagType.ACCESS_ALL_RECORDS];

@RegisteredWorkspaceCommand('2.45.0', 1790858301122)
@Command({
  name: 'upgrade:2-45:add-access-all-records-permission-flag',
  description:
    'Add the permission flag that lets a role access records restricted by sharing',
})
export class AddAccessAllRecordsPermissionFlagCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPermissionFlagMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
        'flatApplicationMaps',
      ]);

    if (
      isDefined(
        findFlatEntityByUniversalIdentifier<FlatPermissionFlag>({
          flatEntityMaps: flatPermissionFlagMaps,
          universalIdentifier: ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER,
        }),
      )
    ) {
      return;
    }

    const twentyStandardApplication =
      findActiveFlatApplicationByUniversalIdentifier(
        flatApplicationMaps,
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      );

    if (!isDefined(twentyStandardApplication)) {
      throw new Error(
        `Twenty standard application not found for workspace ${workspaceId}`,
      );
    }

    const permissionFlagToCreate =
      buildStandardFlatPermissionFlagMetadataMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardApplication.id,
      }).byUniversalIdentifier[ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER];

    if (!isDefined(permissionFlagToCreate)) {
      throw new Error('Access all records permission flag definition missing');
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the access all records permission flag`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runMigration({
      workspaceId,
      permissionFlag: {
        flatEntityToCreate: [permissionFlagToCreate],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPermissionFlagMaps, flatRolePermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
        'flatRolePermissionFlagMaps',
      ]);

    const permissionFlagToDelete =
      findFlatEntityByUniversalIdentifier<FlatPermissionFlag>({
        flatEntityMaps: flatPermissionFlagMaps,
        universalIdentifier: ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(permissionFlagToDelete)) {
      return;
    }

    const rolePermissionFlagsToDelete = Object.values(
      flatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (rolePermissionFlag): rolePermissionFlag is FlatRolePermissionFlag =>
        rolePermissionFlag?.permissionFlagId === permissionFlagToDelete.id,
    );

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: removing the access all records permission flag from ${rolePermissionFlagsToDelete.length} role(s)`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runMigration({
      workspaceId,
      rolePermissionFlag: {
        flatEntityToCreate: [],
        flatEntityToDelete: rolePermissionFlagsToDelete,
        flatEntityToUpdate: [],
      },
      permissionFlag: {
        flatEntityToCreate: [],
        flatEntityToDelete: [permissionFlagToDelete],
        flatEntityToUpdate: [],
      },
    });
  }

  private async runMigration({
    workspaceId,
    ...allFlatEntityOperationByMetadataName
  }: {
    workspaceId: string;
    permissionFlag: {
      flatEntityToCreate: FlatPermissionFlag[];
      flatEntityToDelete: FlatPermissionFlag[];
      flatEntityToUpdate: FlatPermissionFlag[];
    };
    rolePermissionFlag?: {
      flatEntityToCreate: FlatRolePermissionFlag[];
      flatEntityToDelete: FlatRolePermissionFlag[];
      flatEntityToUpdate: FlatRolePermissionFlag[];
    };
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
