import { type QuotaBound } from 'src/engine/core-modules/usage-limit/types/quota-bound.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

const buildRow = (
  overrides: Partial<QuotaConsumptionRow>,
): QuotaConsumptionRow => ({
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  userWorkspaceId: 'user-1',
  apiKeyId: '',
  applicationId: '',
  creditsUsedMicro: '100',
  quantity: '10',
  ...overrides,
});

const buildBound = (overrides: Partial<QuotaBound>): QuotaBound => ({
  key: 'counter-key',
  limitValue: 1_000,
  meter: 'creditsUsedMicro',
  periodUnit: 'billingPeriod',
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  operationType: UsageOperationType.ALL,
  ...overrides,
});

const rows = [
  buildRow({}),
  buildRow({ userWorkspaceId: 'user-2', creditsUsedMicro: '40' }),
  buildRow({
    operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    userWorkspaceId: '',
    creditsUsedMicro: '7',
    quantity: '3',
  }),
];

describe('computeQuotaConsumed', () => {
  it('sums every row for a workspace bound with no operation', () => {
    expect(computeQuotaConsumed({ rows, bound: buildBound({}) })).toBe(147);
  });

  it('cuts by operation when the bound names one', () => {
    expect(
      computeQuotaConsumed({
        rows,
        bound: buildBound({
          operationType: UsageOperationType.AI_CHAT_TOKEN,
        }),
      }),
    ).toBe(140);
  });

  it('matches a named spender on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        bound: buildBound({
          spenderType: 'userWorkspace',
          spenderId: 'user-2',
        }),
      }),
    ).toBe(40);
  });

  it('sums every attributed row for a shared spender bound', () => {
    expect(
      computeQuotaConsumed({
        rows,
        bound: buildBound({ spenderType: 'userWorkspace', spenderId: null }),
      }),
    ).toBe(140);
  });

  it('sums the quantity column when the bound meters on it', () => {
    expect(
      computeQuotaConsumed({ rows, bound: buildBound({ meter: 'quantity' }) }),
    ).toBe(23);
  });

  it('counts nothing for a spender type the warm query does not carry', () => {
    expect(
      computeQuotaConsumed({
        rows,
        bound: buildBound({ spenderType: 'agent', spenderId: 'agent-1' }),
      }),
    ).toBe(0);
  });
});
