import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// A userWorkspace created this recently is ignored, to avoid racing an in-flight
// sign-up that inserts the userWorkspace just before its workspaceMember.
const ORPHAN_MIN_AGE_HOURS = 1;
const ORPHAN_MIN_AGE_MS = ORPHAN_MIN_AGE_HOURS * 60 * 60 * 1000;

@RegisteredWorkspaceCommand('2.16.0', 1802000000000)
@Command({
  name: 'upgrade:2-16:cleanup-orphaned-user-workspaces',
  description:
    'Delete orphaned userWorkspace rows that have no corresponding workspaceMember (the state that makes a removed member impossible to re-invite).',
})
export class CleanupOrphanedUserWorkspacesCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    // Only live userWorkspaces are candidates: soft-deleted ones are already
    // excluded by the invitation guard, and we never want to touch them here.
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { workspaceId },
    });

    if (userWorkspaces.length === 0) {
      return;
    }

    // A userWorkspace is only an orphan when there is NO workspaceMember at all
    // for that user — including soft-deleted ("trashed") members, which we
    // deliberately preserve. If the member lookup fails we skip the whole
    // workspace rather than risk deleting a legitimate membership.
    let memberUserIds: Set<string>;

    try {
      memberUserIds = await this.loadWorkspaceMemberUserIds(workspaceId);
    } catch (error) {
      this.logger.error(
        `Skipping workspace ${workspaceId}: failed to read workspace members (${
          error instanceof Error ? error.message : String(error)
        }). No userWorkspace deleted.`,
      );

      return;
    }

    // Safety net: a workspace with userWorkspaces but no member at all is
    // suspicious (e.g. missing table / read problem). Refuse to delete.
    if (memberUserIds.size === 0) {
      this.logger.warn(
        `Skipping workspace ${workspaceId}: ${userWorkspaces.length} userWorkspace(s) but no workspaceMember found. Needs manual review.`,
      );

      return;
    }

    const orphanedUserWorkspaces = userWorkspaces.filter(
      (userWorkspace) => !memberUserIds.has(userWorkspace.userId),
    );

    if (orphanedUserWorkspaces.length === 0) {
      return;
    }

    // Safety net: never remove every membership of a workspace in one run. If
    // all live userWorkspaces look orphaned, something is wrong upstream.
    if (orphanedUserWorkspaces.length === userWorkspaces.length) {
      this.logger.warn(
        `Skipping workspace ${workspaceId}: all ${userWorkspaces.length} userWorkspace(s) appear orphaned. Refusing to delete; needs manual review.`,
      );

      return;
    }

    const cutoffDate = new Date(Date.now() - ORPHAN_MIN_AGE_MS);

    const deletableUserWorkspaces = orphanedUserWorkspaces.filter(
      (userWorkspace) => userWorkspace.createdAt < cutoffDate,
    );

    const skippedRecentCount =
      orphanedUserWorkspaces.length - deletableUserWorkspaces.length;

    if (skippedRecentCount > 0) {
      this.logger.log(
        `Workspace ${workspaceId}: skipping ${skippedRecentCount} orphaned userWorkspace(s) created within the last ${ORPHAN_MIN_AGE_HOURS}h.`,
      );
    }

    if (deletableUserWorkspaces.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would delete ${
          deletableUserWorkspaces.length
        } orphaned userWorkspace(s): ${deletableUserWorkspaces
          .map((userWorkspace) => userWorkspace.id)
          .join(', ')}`,
      );

      return;
    }

    for (const userWorkspace of deletableUserWorkspaces) {
      // Reuse the canonical deletion so roleTargets are cleaned up consistently.
      // This never touches the user record itself.
      await this.userWorkspaceService.deleteUserWorkspace({
        userWorkspaceId: userWorkspace.id,
      });

      this.logger.log(
        `Workspace ${workspaceId}: deleted orphaned userWorkspace ${userWorkspace.id} (userId ${userWorkspace.userId}).`,
      );
    }
  }

  private async loadWorkspaceMemberUserIds(
    workspaceId: string,
  ): Promise<Set<string>> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMemberRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      const workspaceMembers = await workspaceMemberRepository.find({
        withDeleted: true,
      });

      return new Set(
        workspaceMembers.map((workspaceMember) => workspaceMember.userId),
      );
    }, authContext);
  }
}
