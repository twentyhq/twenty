import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeHealthEnum } from 'twenty-shared/types';
import { formatUpgradeCommandName } from 'twenty-shared/utils';
import {
  type InstanceUpgradeStatus,
  UpgradeStatusService,
  type WorkspaceUpgradeStatus,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

type UpgradeStatusOptions = {
  workspaceId?: Set<string>;
  failedOnly?: boolean;
};

type GroupedWorkspaceUpgradeStatuses = {
  upToDate: WorkspaceUpgradeStatus[];
  behind: WorkspaceUpgradeStatus[];
  failed: WorkspaceUpgradeStatus[];
};

const HEALTH_LABELS: Record<UpgradeHealthEnum, string> = {
  [UpgradeHealthEnum.UP_TO_DATE]: chalk.green('Up to date'),
  [UpgradeHealthEnum.BEHIND]: chalk.yellow('Behind'),
  [UpgradeHealthEnum.FAILED]: chalk.red('Failed'),
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

      const groupedWorkspaceUpgradeStatuses =
        this.groupWorkspaceUpgradeStatusesByHealth(workspaceStatuses);

      lines.push(
        ...this.formatWorkspaceUpgradeStatuses(
          groupedWorkspaceUpgradeStatuses,
          options.failedOnly,
        ),
      );

      lines.push(
        ...this.formatSummary(instanceStatus, groupedWorkspaceUpgradeStatuses),
      );

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

  private formatInstanceStatus(status: InstanceUpgradeStatus): string[] {
    return [
      chalk.bold.underline('Instance'),
      ...this.formatCursorStatus(status),
      '',
    ];
  }

  private formatWorkspaceUpgradeStatuses(
    { upToDate, behind, failed }: GroupedWorkspaceUpgradeStatuses,
    failedOnly?: boolean,
  ): string[] {
    const lines: string[] = [chalk.bold.underline('Workspace')];

    if (upToDate.length === 0 && behind.length === 0 && failed.length === 0) {
      lines.push(chalk.dim('  No active/suspended workspaces found'));

      return lines;
    }

    if (!failedOnly) {
      for (const workspaceStatus of upToDate) {
        lines.push(...this.formatWorkspaceUpgradeStatus(workspaceStatus));
      }
    }

    for (const workspaceStatus of behind) {
      lines.push(...this.formatWorkspaceUpgradeStatus(workspaceStatus));
    }

    if (failed.length > 0) {
      const groupedByCommand = new Map<
        string | null,
        WorkspaceUpgradeStatus[]
      >();

      for (const workspaceStatus of failed) {
        const commandName = workspaceStatus.latestCommand?.name ?? null;

        if (!groupedByCommand.has(commandName)) {
          groupedByCommand.set(commandName, []);
        }

        groupedByCommand.get(commandName)!.push(workspaceStatus);
      }

      for (const [commandName, statuses] of groupedByCommand) {
        const formattedCommandName = commandName
          ? formatUpgradeCommandName(commandName)
          : 'unknown';

        lines.push(chalk.red.bold(`  Failed at: ${formattedCommandName}`));

        for (const workspaceStatus of statuses) {
          lines.push(
            ...this.formatWorkspaceUpgradeStatus(workspaceStatus, true),
          );
        }
      }
    }

    return lines;
  }

  private formatWorkspaceUpgradeStatus(
    status: WorkspaceUpgradeStatus,
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
    status: InstanceUpgradeStatus,
    indent = '  ',
  ): string[] {
    if (!status.latestCommand) {
      return [`${indent}Status:           ${HEALTH_LABELS[status.health]}`];
    }

    const { latestCommand } = status;

    const lines: string[] = [
      `${indent}Inferred version: ${status.inferredVersion ?? chalk.dim('unknown')}`,
      `${indent}Latest command:   ${formatUpgradeCommandName(latestCommand.name)}`,
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
    instanceStatus: InstanceUpgradeStatus,
    { upToDate, behind, failed }: GroupedWorkspaceUpgradeStatuses,
  ): string[] {
    const lines: string[] = [chalk.bold.underline('Summary')];
    const totalCount = upToDate.length + behind.length + failed.length;

    lines.push(`  Instance: ${HEALTH_LABELS[instanceStatus.health]}`);

    if (totalCount === 0) {
      lines.push(chalk.dim('  No workspaces'));

      return lines;
    }

    const parts = [
      chalk.green(`${upToDate.length} up to date`),
      chalk.yellow(`${behind.length} behind`),
      chalk.red(`${failed.length} failed`),
    ];

    lines.push(`  Workspaces: ${parts.join(', ')} (${totalCount} total)`);

    if (behind.length > 0) {
      const behindCounts = new Map<string | null, number>();

      for (const status of behind) {
        const commandName = status.latestCommand?.name ?? null;

        behindCounts.set(commandName, (behindCounts.get(commandName) ?? 0) + 1);
      }

      for (const [commandName, count] of behindCounts) {
        const formattedCommandName = commandName
          ? formatUpgradeCommandName(commandName)
          : 'no commands';

        lines.push(
          chalk.yellow(`    ${count} behind at: ${formattedCommandName}`),
        );
      }
    }

    if (failed.length > 0) {
      const failureCounts = new Map<string | null, number>();

      for (const status of failed) {
        const commandName = status.latestCommand?.name ?? null;

        failureCounts.set(
          commandName,
          (failureCounts.get(commandName) ?? 0) + 1,
        );
      }

      for (const [commandName, count] of failureCounts) {
        const formattedCommandName = commandName
          ? formatUpgradeCommandName(commandName)
          : 'unknown';

        lines.push(
          chalk.red(`    ${count} failed at: ${formattedCommandName}`),
        );
      }
    }

    lines.push('');

    return lines;
  }

  private groupWorkspaceUpgradeStatusesByHealth(
    workspaceStatuses: WorkspaceUpgradeStatus[],
  ): GroupedWorkspaceUpgradeStatuses {
    const upToDate: WorkspaceUpgradeStatus[] = [];
    const behind: WorkspaceUpgradeStatus[] = [];
    const failed: WorkspaceUpgradeStatus[] = [];

    for (const status of workspaceStatuses) {
      switch (status.health) {
        case UpgradeHealthEnum.UP_TO_DATE:
          upToDate.push(status);
          break;
        case UpgradeHealthEnum.BEHIND:
          behind.push(status);
          break;
        case UpgradeHealthEnum.FAILED:
          failed.push(status);
          break;
      }
    }

    return { upToDate, behind, failed };
  }
}
