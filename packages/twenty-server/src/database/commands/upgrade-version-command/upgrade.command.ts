import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { CommandLogger } from 'src/database/commands/logger';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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
    protected readonly twentyConfigService: TwentyConfigService,
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
        // These are workspace-scoped failures; instance/schema-level failures
        // throw earlier (from the sequence runner) and are always fatal because
        // they affect every workspace. A workspace failure only affects that one
        // tenant, so on a multi-workspace instance we surface it and keep the
        // server available for the healthy workspaces. On a single-workspace
        // instance the failed workspace IS the instance, so we fail closed to
        // avoid coming up on a broken schema. UPGRADE_CONTINUE_ON_ERROR forces
        // the tolerant behaviour regardless.
        const isMultiWorkspace =
          this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED') === true;
        const continueOnError =
          process.env.UPGRADE_CONTINUE_ON_ERROR === 'true';

        if (isMultiWorkspace || continueOnError) {
          this.logger.warn(
            formatUpgradeLog({
              humanMessage:
                `Upgrade completed with ${totalFailures} workspace failure(s); ` +
                `continuing startup because ${
                  isMultiWorkspace
                    ? 'IS_MULTIWORKSPACE_ENABLED is true'
                    : 'UPGRADE_CONTINUE_ON_ERROR is true'
                }. Failed workspaces are surfaced via upgrade status and can be re-run.`,
              event: 'workspace-failures.tolerated',
              logFields: { totalFailures, isMultiWorkspace, continueOnError },
            }),
          );

          return;
        }

        throw new Error(
          `Upgrade completed with ${totalFailures} workspace failure(s) on a ` +
            `single-workspace instance. Aborting startup to avoid serving a ` +
            `broken schema. Set UPGRADE_CONTINUE_ON_ERROR=true to override, or ` +
            `IS_MULTIWORKSPACE_ENABLED=true if this is a multi-workspace instance.`,
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
