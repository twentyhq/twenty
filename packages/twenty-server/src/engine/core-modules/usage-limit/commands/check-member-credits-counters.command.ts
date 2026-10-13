import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { MEMBER_CREDITS_COUNTER_CHECK_DEFAULT_TURN_COST_MICRO } from 'src/engine/core-modules/usage-limit/constants/member-credits-counter-check-default-turn-cost-micro.constant';
import { MemberCreditsCounterCheckService } from 'src/engine/core-modules/usage-limit/services/member-credits-counter-check.service';
import { type CreditCounterCheck } from 'src/engine/core-modules/usage-limit/types/credit-counter-check.type';
import { type MemberCreditsCounterCheckReport } from 'src/engine/core-modules/usage-limit/types/member-credits-counter-check-report.type';
import { buildMemberAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-member-allowance-counter-key.util';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

type CheckMemberCreditsCountersOptions = {
  workspaceId: string;
  turnCostMicro: number;
};

@Command({
  name: 'workspace:check-member-credits-counters',
  description:
    'Compare the live Redis allowance and member credits counters of a workspace with their ClickHouse rebuild. Read-only.',
})
export class CheckMemberCreditsCountersCommand extends CommandRunner {
  private readonly logger = new Logger(CheckMemberCreditsCountersCommand.name);

  constructor(
    private readonly memberCreditsCounterCheckService: MemberCreditsCounterCheckService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description: 'Workspace ID',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    if (!isValidUuid(value)) {
      throw new Error('--workspace-id must be a UUID');
    }

    return value;
  }

  @Option({
    flags: '--turn-cost-micro <turn_cost_micro>',
    description:
      'Cost of one chat turn in micro-credits: the drift tolerance, and the margin over the member credits before an overrun is flagged',
    defaultValue: MEMBER_CREDITS_COUNTER_CHECK_DEFAULT_TURN_COST_MICRO,
  })
  parseTurnCostMicro(value: string): number {
    const turnCostMicro = Number(value);

    if (!isValidCreditAmountMicro(turnCostMicro)) {
      throw new Error('--turn-cost-micro must be a non-negative integer');
    }

    return turnCostMicro;
  }

  override async run(
    _passedParams: string[],
    { workspaceId, turnCostMicro }: CheckMemberCreditsCountersOptions,
  ): Promise<void> {
    try {
      const report = await this.memberCreditsCounterCheckService.checkCounters({
        workspaceId,
        turnCostMicro,
      });

      const lines: string[] = [
        '',
        chalk.bold(`Member credits counters of workspace ${workspaceId}`),
        `Turn cost: ${turnCostMicro} micro`,
        '',
      ];

      if (!isDefined(report)) {
        lines.push(
          chalk.dim(
            'No credit allowance: billing is disabled, or the workspace has no subscription or no plan allowance. Nothing to check.',
          ),
        );
      } else {
        lines.push(
          ...this.formatAllowance(report.allowance),
          ...this.formatMemberCredits({
            workspaceId,
            memberCredits: report.memberCredits,
          }),
          ...this.formatSummary(report),
        );
      }

      // oxlint-disable-next-line no-console
      console.log(lines.join('\n'));
    } catch (error) {
      this.logger.error(
        chalk.red(
          `Failed to check member credits counters of workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
        ),
      );

      throw error;
    }
  }

  private formatAllowance(
    allowance: MemberCreditsCounterCheckReport['allowance'],
  ): string[] {
    const { check } = allowance;

    return [
      chalk.bold.underline('Allowance counter'),
      `  Period:  ${allowance.periodStart.toISOString()} -> ${allowance.periodEnd.toISOString()}`,
      `  Limit:   ${allowance.limitValueMicro} micro`,
      `  Key:     ${check.key}`,
      `  Live:    ${this.formatLiveValue(check)}`,
      `  Rebuilt: ${check.rebuiltValueMicro} micro (period total minus member-funded)`,
      `  Drift:   ${this.formatDrift(check)}${this.formatFlags(check)}`,
      '',
    ];
  }

  private formatMemberCredits({
    workspaceId,
    memberCredits,
  }: {
    workspaceId: string;
    memberCredits: MemberCreditsCounterCheckReport['memberCredits'];
  }): string[] {
    const lines: string[] = [chalk.bold.underline('Member counters')];

    if (!isDefined(memberCredits)) {
      lines.push(
        chalk.dim(
          '  Member credits are off: flag disabled, no member credit amount on the seat price, or the cached period has ended.',
        ),
        '',
      );

      return lines;
    }

    lines.push(
      `  Slice:    ${memberCredits.periodStart.toISOString()} -> ${memberCredits.periodEnd.toISOString()}`,
      `  Amount:   ${memberCredits.amountMicro} micro per member`,
      `  Fallback: ${memberCredits.fallback}`,
      `  Key:      ${buildMemberAllowanceCounterKey({
        workspaceId,
        userWorkspaceId: '<userWorkspaceId>',
        periodStart: memberCredits.periodStart,
      })}`,
    );

    for (const memberCheck of memberCredits.memberChecks) {
      lines.push(
        `  ${memberCheck.userWorkspaceId}  live: ${this.formatLiveValue(memberCheck)}  rebuilt: ${memberCheck.rebuiltValueMicro} micro  drift: ${this.formatDrift(memberCheck)}${this.formatFlags(memberCheck)}`,
      );
    }

    lines.push(
      chalk.dim(
        `  ${memberCredits.idleMemberCount} other member(s) have no counter and no member-funded usage in this slice`,
      ),
      '',
    );

    return lines;
  }

  private formatSummary(report: MemberCreditsCounterCheckReport): string[] {
    const checks: CreditCounterCheck[] = [
      report.allowance.check,
      ...(report.memberCredits?.memberChecks ?? []),
    ];
    const driftedCount = checks.filter((check) => check.isDrifted).length;
    const overrunCount = checks.filter((check) => check.isOverrun).length;

    const lines: string[] = [
      chalk.bold.underline('Summary'),
      `  Counters checked: ${checks.length}`,
      driftedCount > 0
        ? chalk.red(`  Drifted by more than one turn: ${driftedCount}`)
        : chalk.green('  Drifted by more than one turn: 0'),
    ];

    if (report.memberCredits?.fallback === 'WORKSPACE_CREDITS') {
      lines.push(
        overrunCount > 0
          ? chalk.red(
              `  Members funded above the member credits plus one turn: ${overrunCount} (rule out a member credits change in this slice first)`,
            )
          : chalk.green(
              '  Members funded above the member credits plus one turn: 0',
            ),
      );
    }

    lines.push('');

    return lines;
  }

  private formatLiveValue(check: CreditCounterCheck): string {
    return isDefined(check.liveValueMicro)
      ? `${check.liveValueMicro} micro`
      : chalk.dim('cold');
  }

  private formatDrift(check: CreditCounterCheck): string {
    if (!isDefined(check.driftMicro)) {
      return chalk.dim('n/a');
    }

    return check.driftMicro > 0
      ? `+${check.driftMicro} micro`
      : `${check.driftMicro} micro`;
  }

  private formatFlags(check: CreditCounterCheck): string {
    const flags = [
      ...(check.isDrifted ? [chalk.red('DRIFT')] : []),
      ...(check.isOverrun ? [chalk.red('OVERRUN')] : []),
    ];

    return flags.length > 0 ? `  ${flags.join(' ')}` : '';
  }
}
