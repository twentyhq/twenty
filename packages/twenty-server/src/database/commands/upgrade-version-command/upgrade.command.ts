import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { CommandLogger } from 'src/database/commands/logger';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';

type RawUpgradeCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

export type ParsedUpgradeCommandOptions = {
  workspaceIds?: string[];
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    protected readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    protected readonly upgradeSequenceRunnerService: UpgradeSequenceRunnerService,
    protected readonly upgradeStatusService: UpgradeStatusService,
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
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all provisioned workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(val);

    return accumulator;
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

  override async run(
    _passedParams: string[],
    options: RawUpgradeCommandOptions,
  ): Promise<void> {
    if (options.verbose) {
      this.logger = new CommandLogger({
        verbose: true,
        constructorName: this.constructor.name,
      });
    }

    if (
      isDefined(options.workspaceId) &&
      isDefined(options.startFromWorkspaceId)
    ) {
      throw new Error(
        'Cannot use --start-from-workspace-id together with -w/--workspace-id',
      );
    }

    try {
      const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

      this.logger.log(
        formatUpgradeLog({
          humanMessage: `Initialized upgrade sequence: ${sequence.length} step(s)`,
          event: 'sequence.initialized',
          logFields: {
            stepCount: sequence.length,
            dryRun: options.dryRun ?? false,
          },
        }),
      );

      for (const [index, step] of sequence.entries()) {
        this.logger.verbose(
          formatUpgradeLog({
            humanMessage: `  [${index}] ${step.kind} — ${step.name} (${step.version})`,
            event: 'sequence.step',
            logFields: {
              index,
              kind: step.kind,
              name: step.name,
              version: step.version,
            },
          }),
        );
      }

      const { totalSuccesses, totalFailures } =
        await this.upgradeSequenceRunnerService.run({
          sequence,
          options: {
            ...options,
            workspaceIds: isDefined(options.workspaceId)
              ? Array.from(options.workspaceId)
              : undefined,
          },
        });

      this.logger.log(
        formatUpgradeLog({
          humanMessage: `Upgrade summary: ${totalSuccesses} workspace(s) succeeded, ${totalFailures} workspace(s) failed`,
          event: 'summary',
          logFields: {
            totalSuccesses,
            totalFailures,
            dryRun: options.dryRun ?? false,
          },
        }),
      );

      if (totalFailures > 0) {
        throw new Error(
          `Upgrade completed with ${totalFailures} workspace failure(s)`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        formatUpgradeLog({
          humanMessage: `Upgrade failed: ${errorMessage}`,
          event: 'aborted',
        }),
      );
      throw error;
    } finally {
      await this.safeInvalidateUpgradeStatusCache();
    }
  }

  private async safeInvalidateUpgradeStatusCache(): Promise<void> {
    try {
      await this.upgradeStatusService.invalidateInstanceAndAllWorkspacesStatus();
    } catch (error) {
      this.logger.error(
        formatUpgradeLog({
          humanMessage: `Failed to invalidate upgrade-status cache: ${
            error instanceof Error ? error.message : String(error)
          }`,
          event: 'cache.invalidate.failed',
        }),
      );
    }
  }
}
