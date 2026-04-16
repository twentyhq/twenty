import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  type MigrationCursorStatus,
  UpgradeHealth,
  UpgradeStatusService,
  type WorkspaceStatus,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

type UpgradeStatusOptions = {
  workspaceId?: Set<string>;
  failedOnly?: boolean;
};

const HEALTH_LABELS: Record<UpgradeHealth, string> = {
  'up-to-date': chalk.green('Up to date'),
  behind: chalk.yellow('Behind'),
  failed: chalk.red('Failed'),
};

@Command({
  name: 'upgrade:status',
  description:
    'Display upgrade status for instance and workspace commands, inferring versions from migration history',
})
export class UpgradeStatusCommand extends CommandRunner {
  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'Filter to specific workspace IDs. Can be passed multiple times.',
    required: false,
  })
  parseWorkspaceId(value: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(value);

    return accumulator;
  }

  @Option({
    flags: '-f, --failed-only',
    description:
      'Hide up-to-date entries, only display failed and behind commands',
  })
  parseFailedOnly(): boolean {
    return true;
  }

  private readonly logger = new Logger(UpgradeStatusCommand.name);

  constructor(
    private readonly upgradeStatusService: UpgradeStatusService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  override async run(
    _passedParams: string[],
    options: UpgradeStatusOptions,
  ): Promise<void> {
    try {
      const lines: string[] = this.formatHeader();

      const instanceStatus =
        await this.upgradeStatusService.getInstanceStatus();

      lines.push(...this.formatInstanceStatus(instanceStatus));

      const requestedWorkspaceIds = options.workspaceId
        ? [...options.workspaceId]
        : undefined;

      const workspaceStatuses =
        await this.upgradeStatusService.getWorkspaceStatuses(
          requestedWorkspaceIds,
        );

      lines.push(
        ...this.formatWorkspaceStatuses(workspaceStatuses, options.failedOnly),
      );

      lines.push(...this.formatSummary(instanceStatus, workspaceStatuses));

      console.log(lines.join('\n'));
    } catch (error) {
      this.logger.error(
        chalk.red(`Failed to retrieve upgrade status: ${error.message}`),
      );
    }
  }

  private formatHeader(): string[] {
    const appVersion = this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    return ['', chalk.bold(`APP_VERSION: ${appVersion}`), ''];
  }

  private formatInstanceStatus(status: MigrationCursorStatus): string[] {
    return [
      chalk.bold.underline('Instance'),
      ...this.formatCursorStatus(status),
      '',
    ];
  }

  private formatWorkspaceStatuses(
    workspaceStatuses: WorkspaceStatus[],
    failedOnly?: boolean,
  ): string[] {
    const lines: string[] = [chalk.bold.underline('Workspace')];

    if (workspaceStatuses.length === 0) {
      lines.push(chalk.dim('  No active/suspended workspaces found'));

      return lines;
    }

    const failed = workspaceStatuses.filter(
      (status) => status.health === 'failed',
    );

    const upToDate = workspaceStatuses.filter(
      (status) => status.health === 'up-to-date',
    );
    const behind = workspaceStatuses.filter(
      (status) => status.health === 'behind',
    );

    if (!failedOnly) {
      for (const workspaceStatus of upToDate) {
        lines.push(...this.formatWorkspaceStatus(workspaceStatus));
      }
    }

    for (const workspaceStatus of behind) {
      lines.push(...this.formatWorkspaceStatus(workspaceStatus));
    }

    if (failed.length > 0) {
      const groupedByCommand = new Map<string, WorkspaceStatus[]>();

      for (const workspaceStatus of failed) {
        const commandName = workspaceStatus.latestCommand?.name ?? 'unknown';

        if (!groupedByCommand.has(commandName)) {
          groupedByCommand.set(commandName, []);
        }

        groupedByCommand.get(commandName)!.push(workspaceStatus);
      }

      for (const [commandName, statuses] of groupedByCommand) {
        lines.push(chalk.red.bold(`  Failed at: ${commandName}`));

        for (const workspaceStatus of statuses) {
          lines.push(...this.formatWorkspaceStatus(workspaceStatus, true));
        }
      }
    }

    return lines;
  }

  private formatWorkspaceStatus(
    status: WorkspaceStatus,
    nested = false,
  ): string[] {
    const baseIndent = nested ? '    ' : '  ';
    const detailIndent = nested ? '      ' : '    ';
    const label = status.displayName
      ? `${status.displayName} (${status.workspaceId})`
      : status.workspaceId;

    return [
      chalk.bold(`${baseIndent}${label}`),
      ...this.formatCursorStatus(status, detailIndent),
      '',
    ];
  }

  private formatCursorStatus(
    status: MigrationCursorStatus,
    indent = '  ',
  ): string[] {
    if (!status.latestCommand) {
      return [`${indent}Status:           ${HEALTH_LABELS[status.health]}`];
    }

    const { latestCommand } = status;

    const lines: string[] = [
      `${indent}Inferred version: ${status.inferredVersion ?? chalk.dim('unknown')}`,
      `${indent}Latest command:   ${latestCommand.name}`,
      `${indent}Status:           ${HEALTH_LABELS[status.health]}`,
      `${indent}Executed by:      ${latestCommand.executedByVersion}`,
      `${indent}At:               ${latestCommand.createdAt.toISOString()}`,
    ];

    if (latestCommand.status === 'failed' && latestCommand.errorMessage) {
      lines.push(
        chalk.red(`${indent}Error:            ${latestCommand.errorMessage}`),
      );
    }

    return lines;
  }

  private formatSummary(
    instanceStatus: MigrationCursorStatus,
    workspaceStatuses: WorkspaceStatus[],
  ): string[] {
    const lines: string[] = [chalk.bold.underline('Summary')];

    lines.push(`  Instance: ${HEALTH_LABELS[instanceStatus.health]}`);

    if (workspaceStatuses.length === 0) {
      lines.push(chalk.dim('  No workspaces'));

      return lines;
    }

    const upToDateCount = workspaceStatuses.filter(
      (status) => status.health === 'up-to-date',
    ).length;
    const behindCount = workspaceStatuses.filter(
      (status) => status.health === 'behind',
    ).length;
    const failedStatuses = workspaceStatuses.filter(
      (status) => status.health === 'failed',
    );

    const parts = [
      chalk.green(`${upToDateCount} up to date`),
      chalk.yellow(`${behindCount} behind`),
      chalk.red(`${failedStatuses.length} failed`),
    ];

    lines.push(
      `  Workspaces: ${parts.join(', ')} (${workspaceStatuses.length} total)`,
    );

    const behindStatuses = workspaceStatuses.filter(
      (status) => status.health === 'behind',
    );

    if (behindStatuses.length > 0) {
      const behindCounts = new Map<string, number>();

      for (const status of behindStatuses) {
        const commandName = status.latestCommand?.name ?? 'no commands';

        behindCounts.set(commandName, (behindCounts.get(commandName) ?? 0) + 1);
      }

      for (const [commandName, count] of behindCounts) {
        lines.push(chalk.yellow(`    ${count} behind at: ${commandName}`));
      }
    }

    if (failedStatuses.length > 0) {
      const failureCounts = new Map<string, number>();

      for (const status of failedStatuses) {
        const commandName = status.latestCommand?.name ?? 'unknown';

        failureCounts.set(
          commandName,
          (failureCounts.get(commandName) ?? 0) + 1,
        );
      }

      for (const [commandName, count] of failureCounts) {
        lines.push(chalk.red(`    ${count} failed at: ${commandName}`));
      }
    }

    lines.push('');

    return lines;
  }
}
