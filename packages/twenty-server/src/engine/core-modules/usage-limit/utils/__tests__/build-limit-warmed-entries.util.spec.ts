import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { buildLimitWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-limit-warmed-entries.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const NOW = new Date('2026-08-20T00:00:00.000Z').getTime();

const buildCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  key: 'counter-key',
  limitValueType: 'absolute',
  limitValue: 1_000,
  meter: 'creditsUsedMicro',
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  ...overrides,
});

const buildRow = (
  overrides: Partial<QuotaConsumptionRow> = {},
): QuotaConsumptionRow => ({
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  userWorkspaceId: 'user-1',
  apiKeyId: '',
  applicationId: '',
  agentId: '',
  workflowId: '',
  logicFunctionId: '',
  creditsUsedMicro: '0',
  quantity: '0',
  ...overrides,
});

const buildRowsByPeriod = (
  counter: LimitQuotaCounter,
  rows: QuotaConsumptionRow[],
) => new Map([[buildPeriodGroupKey(counter), rows]]);

describe('buildLimitWarmedEntries', () => {
  it('seeds the counter with its budget minus the stamped consumption', () => {
    const counter = buildCounter();

    expect(
      buildLimitWarmedEntries({
        coldLimitCounters: [counter],
        rowsByPeriod: buildRowsByPeriod(counter, [
          buildRow({ creditsUsedMicro: '150' }),
          buildRow({ userWorkspaceId: 'user-2', creditsUsedMicro: '100' }),
        ]),
        allowance: null,
        now: NOW,
      }),
    ).toEqual([
      {
        key: 'counter-key',
        value: 750,
        ttl: counter.periodEnd.getTime() - NOW,
      },
    ]);
  });

  it('counts only the rows the counter spender stamped', () => {
    const counter = buildCounter({
      spenderType: 'userWorkspace',
      spenderId: 'user-1',
    });

    expect(
      buildLimitWarmedEntries({
        coldLimitCounters: [counter],
        rowsByPeriod: buildRowsByPeriod(counter, [
          buildRow({ creditsUsedMicro: '150' }),
          buildRow({ userWorkspaceId: 'user-2', creditsUsedMicro: '100' }),
        ]),
        allowance: null,
        now: NOW,
      }),
    ).toMatchObject([{ value: 850 }]);
  });

  it('seeds a percent counter from the allowance of its period', () => {
    const counter = buildCounter({
      limitValueType: 'allowancePercent',
      limitValue: 40,
      periodUnit: 'allowancePeriod',
    });

    expect(
      buildLimitWarmedEntries({
        coldLimitCounters: [counter],
        rowsByPeriod: buildRowsByPeriod(counter, [
          buildRow({ creditsUsedMicro: '150' }),
        ]),
        allowance: {
          periodStart: counter.periodStart,
          periodEnd: counter.periodEnd,
          allowanceMicro: 2_000,
        },
        now: NOW,
      }),
    ).toMatchObject([{ value: 650 }]);
  });

  it('skips a percent counter when the allowance is gone', () => {
    const counter = buildCounter({
      limitValueType: 'allowancePercent',
      limitValue: 40,
      periodUnit: 'allowancePeriod',
    });

    expect(
      buildLimitWarmedEntries({
        coldLimitCounters: [counter],
        rowsByPeriod: buildRowsByPeriod(counter, [buildRow({})]),
        allowance: null,
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips a counter whose period already ended', () => {
    const counter = buildCounter({
      periodEnd: new Date('2026-08-10T00:00:00.000Z'),
    });

    expect(
      buildLimitWarmedEntries({
        coldLimitCounters: [counter],
        rowsByPeriod: buildRowsByPeriod(counter, [buildRow({})]),
        allowance: null,
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips a counter whose consumption was not fetched', () => {
    expect(
      buildLimitWarmedEntries({
        coldLimitCounters: [buildCounter()],
        rowsByPeriod: new Map(),
        allowance: null,
        now: NOW,
      }),
    ).toEqual([]);
  });
});
