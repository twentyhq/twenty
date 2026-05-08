import chalk from 'chalk';
import { CommandRunner, Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CommandLogger } from 'src/database/commands/logger';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';

export type WorkspaceCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

export type RunOnWorkspaceArgs = {
  options: WorkspaceCommandOptions;
  workspaceId: string;
  dataSource?: GlobalWorkspaceDataSource;
  index: number;
  total: number;
};

export abstract class WorkspaceCommandRunner<
  Options extends WorkspaceCommandOptions = WorkspaceCommandOptions,
> extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    protected readonly activationStatuses: WorkspaceActivationStatus[],
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate the command without making actual changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Verbose output',
    required: false,
  })
  parseVerbose(): boolean {
    return true;
  }

  @Option({
    flags: '--start-from-workspace-id [workspace_id]',
    description:
      'Start from a specific workspace id. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseStartFromWorkspaceId(val: string): string {
    return val;
  }

  @Option({
    flags: '--workspace-count-limit [count]',
    description:
      'Limit the number of workspaces to process. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseWorkspaceCountLimit(val: string): number {
    const limit = parseInt(val);

    if (isNaN(limit)) {
      throw new Error('Workspace count limit must be a number');
    }

    if (limit <= 0) {
      throw new Error('Workspace count limit must be greater than 0');
    }

    return limit;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all workspaces matching the activation statuses if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(val);

    return accumulator;
  }

  override async run(_passedParams: string[], options: Options): Promise<void> {
    if (options.verbose) {
      this.logger = new CommandLogger({
        verbose: true,
        constructorName: this.constructor.name,
      });
    }

    try {
      await this.workspaceIteratorService.iterate({
        workspaceIds:
          options.workspaceId && options.workspaceId.size > 0
            ? Array.from(options.workspaceId)
            : undefined,
        activationStatuses: this.activationStatuses,
        startFromWorkspaceId: options.startFromWorkspaceId,
        workspaceCountLimit: options.workspaceCountLimit,
        dryRun: options.dryRun,
        callback: async (context) => {
          await this.runOnWorkspace({
            options,
            workspaceId: context.workspaceId,
            dataSource: context.dataSource,
            index: context.index,
            total: context.total,
          });
        },
      });

      this.logger.log(chalk.blue('Command completed!'));
    } catch (error) {
      this.logger.error(chalk.red(`Command failed`));
      throw error;
    }
  }

  public abstract runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void>;
}
