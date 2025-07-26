import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Raw, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:0-54:lowercase-user-and-invitation-emails',
  description: 'Lowercase user and invitation emails',
})
export class LowercaseUserAndInvitationEmailsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(User, 'core')
    protected readonly userRepository: Repository<User>,
    @InjectRepository(AppToken, 'core')
    protected readonly appTokenRepository: Repository<AppToken>,
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.lowercaseUserEmails(workspaceId, !!options.dryRun);
    await this.lowercaseInvitationEmails(workspaceId, !!options.dryRun);
  }

  private async lowercaseUserEmails(workspaceId: string, dryRun: boolean) {
    const users = await this.userRepository.find({
      where: {
        userWorkspaces: {
          workspaceId,
        },
        email: Raw((alias) => `LOWER(${alias}) != ${alias}`),
      },
    });

    if (users.length === 0) return;

    for (const user of users) {
      if (!dryRun) {
        await this.userRepository.update(
          {
            id: user.id,
          },
          {
            email: user.email.toLowerCase(),
          },
        );
      }

      this.logger.log(
        `Lowercased user email ${user.email} for workspace ${workspaceId}`,
      );
    }
  }

  private async lowercaseInvitationEmails(
    workspaceId: string,
    dryRun: boolean,
  ) {
    const appTokens = await this.appTokenRepository.find({
      where: {
        workspaceId,
        type: AppTokenType.InvitationToken,
        context: Raw((_) => `LOWER(context->>'email') != context->>'email'`),
      },
    });

    if (appTokens.length === 0) return;

    for (const appToken of appTokens) {
      if (!dryRun) {
        await this.appTokenRepository.update(
          {
            id: appToken.id,
          },
          {
            context: {
              ...appToken.context,
              email: appToken.context?.email.toLowerCase(),
            },
          },
        );
      }

      this.logger.log(
        `Lowercased invitation email ${appToken.context?.email} for workspace ${workspaceId}`,
      );
    }
  }
}
