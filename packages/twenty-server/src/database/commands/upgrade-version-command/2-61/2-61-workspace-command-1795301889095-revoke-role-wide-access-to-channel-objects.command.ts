import { Command } from 'nest-commander';
import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-61/constants/channel-object-universal-identifiers.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

const NO_RECORDS_PERMISSIONS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

@RegisteredWorkspaceCommand('2.61.0', 1795301889095)
@Command({
  name: 'upgrade:2-61:revoke-role-wide-access-to-channel-objects',
  description:
    'Revoke the role wide access of user roles to message and calendar objects in workspaces enforcing channel visibility through individual roles',
})
export class RevokeRoleWideAccessToChannelObjectsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      featureFlagsMap,
      flatRoleMaps,
      flatObjectPermissionMaps,
      flatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'flatRoleMaps',
      'flatObjectPermissionMaps',
      'flatObjectMetadataMaps',
    ]);

    if (
      featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED] !==
        true ||
      featureFlagsMap[
        FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED
      ] !== true
    ) {
      return;
    }

    const userRoles = Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ canBeAssignedToUsers }) => canBeAssignedToUsers);
    const channelObjectUniversalIdentifiers =
      CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS.filter((objectUniversalIdentifier) =>
        isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ],
        ),
      );
    const existingObjectPermissions = Object.values(
      flatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const now = new Date().toISOString();

    const operationsByApplicationUniversalIdentifier = new Map<
      string,
      {
        flatEntityToCreate: (UniversalFlatObjectPermission & { id: string })[];
        flatEntityToUpdate: UniversalFlatObjectPermission[];
      }
    >();

    for (const {
      universalIdentifier: roleUniversalIdentifier,
      applicationUniversalIdentifier,
    } of userRoles) {
      const operations = operationsByApplicationUniversalIdentifier.get(
        applicationUniversalIdentifier,
      ) ?? { flatEntityToCreate: [], flatEntityToUpdate: [] };

      operationsByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        operations,
      );

      for (const objectMetadataUniversalIdentifier of channelObjectUniversalIdentifiers) {
        const existingObjectPermission = existingObjectPermissions.find(
          (objectPermission) =>
            objectPermission.roleUniversalIdentifier ===
              roleUniversalIdentifier &&
            objectPermission.objectMetadataUniversalIdentifier ===
              objectMetadataUniversalIdentifier,
        );

        if (!isDefined(existingObjectPermission)) {
          operations.flatEntityToCreate.push({
            id: v4(),
            universalIdentifier: getObjectPermissionUniversalIdentifier({
              applicationUniversalIdentifier,
              roleUniversalIdentifier,
              objectUniversalIdentifier: objectMetadataUniversalIdentifier,
            }),
            applicationUniversalIdentifier,
            roleUniversalIdentifier,
            objectMetadataUniversalIdentifier,
            ...NO_RECORDS_PERMISSIONS,
            createdAt: now,
            updatedAt: now,
          });

          continue;
        }

        const isAlreadyRevoked =
          existingObjectPermission.canReadObjectRecords === false &&
          existingObjectPermission.canCreateObjectRecords === false &&
          existingObjectPermission.canUpdateObjectRecords === false &&
          existingObjectPermission.canSoftDeleteObjectRecords === false &&
          existingObjectPermission.canDestroyObjectRecords === false;

        if (!isAlreadyRevoked) {
          operations.flatEntityToUpdate.push({
            universalIdentifier: existingObjectPermission.universalIdentifier,
            applicationUniversalIdentifier:
              existingObjectPermission.applicationUniversalIdentifier,
            roleUniversalIdentifier,
            objectMetadataUniversalIdentifier,
            ...NO_RECORDS_PERMISSIONS,
            createdAt: existingObjectPermission.createdAt,
            updatedAt: now,
          });
        }
      }
    }

    for (const [
      applicationUniversalIdentifier,
      { flatEntityToCreate, flatEntityToUpdate },
    ] of operationsByApplicationUniversalIdentifier) {
      if (flatEntityToCreate.length === 0 && flatEntityToUpdate.length === 0) {
        continue;
      }

      this.logger.log(
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: revoking role wide access to channel objects for application ${applicationUniversalIdentifier} (${flatEntityToCreate.length} object permissions to create, ${flatEntityToUpdate.length} to update)`,
      );

      if (options.dryRun) {
        continue;
      }

      const migrationArgs = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          objectPermission: {
            flatEntityToCreate,
            flatEntityToUpdate,
            flatEntityToDelete: [],
          },
        },
      };
      const result =
        applicationUniversalIdentifier ===
        twentyStandardFlatApplication.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to revoke role wide access to channel objects for workspace ${workspaceId}`,
        );
      }
    }
  }
}
