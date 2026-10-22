import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getAvailableMemberRoleLabel } from 'src/database/commands/upgrade-version-command/2-50/utils/get-available-member-role-label.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FLAT_MAPS_REFERENCING_ROLE_UNIVERSAL_IDENTIFIER = (
  [
    'role',
    'roleTarget',
    'rolePermissionFlag',
    'objectPermission',
    'fieldPermission',
    'rowLevelPermissionPredicate',
    'rowLevelPermissionPredicateGroup',
  ] as const
).map(getMetadataFlatEntityMapsKey);

@RegisteredWorkspaceCommand('2.50.0', 1792413669590)
@Command({
  name: 'upgrade:2-50:backfill-member-role-universal-identifier',
  description:
    'Give the Member role its fixed universal identifier, creating Member where the workspace has none',
})
export class BackfillMemberRoleUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly roleService: RoleService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    const flatRoles = Object.values(flatRoleMaps.byUniversalIdentifier).filter(
      isDefined,
    );

    if (
      flatRoles.some(
        (flatRole) =>
          flatRole.universalIdentifier === MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
      )
    ) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const memberFlatRole = flatRoles.find(
      (flatRole) =>
        flatRole.label === MEMBER_ROLE_LABEL &&
        flatRole.applicationId === workspaceCustomFlatApplication.id,
    );

    const memberRoleLabel = getAvailableMemberRoleLabel(
      flatRoles.map(({ label }) => label),
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would ${isDefined(memberFlatRole) ? `stamp role ${memberFlatRole.id}` : `create a Member role labelled "${memberRoleLabel}"`}`,
      );

      return;
    }

    if (!isDefined(memberFlatRole)) {
      await this.roleService.createMemberRole({
        workspaceId,
        ownerFlatApplication: workspaceCustomFlatApplication,
        label: memberRoleLabel,
      });

      this.logger.log(
        `Workspace ${workspaceId}: created a Member role labelled "${memberRoleLabel}"`,
      );

      return;
    }

    await this.coreDataSource.query(
      `UPDATE core."role" SET "universalIdentifier" = $1 WHERE id = $2 AND "workspaceId" = $3`,
      [MEMBER_ROLE_UNIVERSAL_IDENTIFIER, memberFlatRole.id, workspaceId],
    );

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      FLAT_MAPS_REFERENCING_ROLE_UNIVERSAL_IDENTIFIER,
    );

    this.logger.log(
      `Workspace ${workspaceId}: stamped Member role ${memberFlatRole.id}`,
    );
  }
}
