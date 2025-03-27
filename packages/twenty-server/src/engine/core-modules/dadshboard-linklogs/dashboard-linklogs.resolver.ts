import { ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { LinkLogsWorkspaceEntity } from 'src/modules/linklogs/standard-objects/linklog.workspace-entity';

@Resolver(() => LinkLogsWorkspaceEntity)
export class DashboardLinklogsResolver {
  private readonly logger = new Logger('DashboardLinklogsResolver');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Query(() => [LinkLogsWorkspaceEntity])
  async getDashboardLinklogs(@AuthWorkspace() workspace: Workspace) {
    if (!workspace) {
      this.logger.error('Workspace not found');
      throw new ForbiddenException('Workspace not found');
    }

    const linklogsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<LinkLogsWorkspaceEntity>(
        workspace.id,
        'linkLogs',
      );

    const linklogs = await linklogsRepository.find();

    return linklogs;
  }
}
