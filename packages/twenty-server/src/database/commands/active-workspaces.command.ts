import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Option } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  BaseCommandOptions,
  BaseCommandRunner,
} from 'src/database/commands/base.command';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';

export type ActiveWorkspacesCommandOptions = BaseCommandOptions & {
  workspaceId?: string;
};

export abstract class ActiveWorkspacesCommandRunner extends BaseCommandRunner {
  private workspaceIds: string[] = [];

  protected readonly logger: Logger;

  constructor(protected readonly workspaceRepository: Repository<Workspace>) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(val: string): string[] {
    this.workspaceIds.push(val);

    return this.workspaceIds;
  }

  protected async fetchActiveWorkspaceIds(): Promise<string[]> {
    const activeWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    return activeWorkspaces.map((workspace) => workspace.id);
  }

  protected logWorkspaceCount(activeWorkspaceIds: string[]): void {
    if (!activeWorkspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));
    } else {
      this.logger.log(
        chalk.green(
          `Running command on ${activeWorkspaceIds.length} workspaces`,
        ),
      );
    }
  }

  override async executeBaseCommand(
    passedParams: string[],
    options: BaseCommandOptions,
  ): Promise<void> {
    const activeWorkspaceIds =
      this.workspaceIds.length > 0
        ? this.workspaceIds
        : await this.fetchActiveWorkspaceIds();

    this.logWorkspaceCount(activeWorkspaceIds);

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    await this.executeActiveWorkspacesCommand(
      passedParams,
      options,
      activeWorkspaceIds,
    );
  }

  protected abstract executeActiveWorkspacesCommand(
    passedParams: string[],
    options: BaseCommandOptions,
    activeWorkspaceIds: string[],
  ): Promise<void>;
}
