import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const NOW = new Date('2026-08-20T00:00:00.000Z');
const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const buildLimitCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  usageLimitId: 'limit-1',
  isDefault: false,
  isEnforced: true,
  key: 'counter-key',
  limitValue: 1_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'userWorkspace',
  spenderId: 'user-1',
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  ...overrides,
});

const allowanceCounter: AllowanceQuotaCounter = {
  kind: 'allowance',
  key: 'allowance-key',
  limitValue: 2_000_000,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

describe('buildQuotaExhaustedScope', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('scopes an exhausted limit counter to its spender', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        counter: buildLimitCounter(),
      }),
    ).toEqual({
      resourceType: UsageResourceType.AI,
      limitKind: 'quota',
      exhaustedKind: 'limit',
      spenderType: 'userWorkspace',
      spenderId: 'user-1',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      unit: UsageUnit.CREDIT,
      limitValue: 1_000,
      remaining: 0,
      periodCount: 1,
      periodUnit: 'month',
      retryAfterMs: PERIOD_END.getTime() - NOW.getTime(),
      isDefault: false,
    });
  });

  it('marks a scope built from a default counter', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        counter: buildLimitCounter({ isDefault: true }),
      }),
    ).toMatchObject({ exhaustedKind: 'limit', isDefault: true });
  });

  it('scopes an exhausted allowance counter to the whole workspace', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        counter: allowanceCounter,
      }),
    ).toEqual({
      resourceType: UsageResourceType.AI,
      limitKind: 'quota',
      exhaustedKind: 'allowance',
      spenderType: 'workspace',
      spenderId: null,
      operationType: UsageOperationType.ALL,
      unit: UsageUnit.CREDIT,
      limitValue: 2_000_000,
      remaining: 0,
      periodCount: null,
      periodUnit: null,
      retryAfterMs: PERIOD_END.getTime() - NOW.getTime(),
    });
  });

  it('clamps the retry delay to zero once the period has ended', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        counter: buildLimitCounter({
          periodEnd: new Date('2026-08-10T00:00:00.000Z'),
        }),
      }),
    ).toMatchObject({ retryAfterMs: 0 });
  });
});
