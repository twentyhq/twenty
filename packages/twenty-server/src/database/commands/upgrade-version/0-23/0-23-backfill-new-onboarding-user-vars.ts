import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { UpdateFileFolderStructureCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-file-folder-structure.command';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';

interface BackfillNewOnboardingUserVarsCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23:backfill-new-onboarding-user-vars',
  description: 'Backfill new onboarding user vars for existing workspaces',
})
export class BackfillNewOnboardingUserVarsCommand extends CommandRunner {
  private readonly logger = new Logger(UpdateFileFolderStructureCommand.name);
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly onboardingService: OnboardingService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: BackfillNewOnboardingUserVarsCommandOptions,
  ): Promise<void> {
    let workspaces;

    if (options.workspaceId) {
      workspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
          id: options.workspaceId,
        },
        relations: ['users'],
      });
    } else {
      workspaces = await this.workspaceRepository.find({
        where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
        relations: ['users'],
      });
    }

    if (!workspaces.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    }

    this.logger.log(
      chalk.green(`Running command on ${workspaces.length} workspaces`),
    );

    for (const workspace of workspaces) {
      this.logger.log(
        chalk.green(`Running command on workspace ${workspace.id}`),
      );

      await this.onboardingService.toggleOnboardingInviteTeamCompletion({
        workspaceId: workspace.id,
        value: true,
      });

      for (const user of workspace.users) {
        await this.onboardingService.toggleOnboardingConnectAccountCompletion({
          userId: user.id,
          workspaceId: workspace.id,
          value: true,
        });

        await this.onboardingService.toggleOnboardingCreateProfileCompletion({
          userId: user.id,
          workspaceId: workspace.id,
          value: true,
        });
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
