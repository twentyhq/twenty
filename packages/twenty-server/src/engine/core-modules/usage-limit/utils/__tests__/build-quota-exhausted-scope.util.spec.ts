import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
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
  isDefault: false,
  key: 'counter-key',
  limitValue: 1_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'userWorkspace',
  spenderId: 'user-1',
  operationTypes: [UsageOperationType.AI_CHAT_TOKEN],
  ...overrides,
});

const workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter = {
  kind: 'workspaceAllowance',
  key: 'allowance-key',
  limitValue: 2_000_000,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const USER_ALLOWANCE_PERIOD_END = new Date('2026-08-25T00:00:00.000Z');

const userAllowanceCounter: UserAllowanceQuotaCounter = {
  kind: 'userAllowance',
  key: 'user-allowance-key',
  limitValue: 3_000_000,
  unit: UsageUnit.USER_CREDIT,
  resourceType: UsageResourceType.AI,
  operationTypes: [UsageOperationType.ALL],
  periodUnit: 'week',
  isDefault: true,
  spenderType: 'userWorkspace',
  spenderId: 'user-workspace-1',
  periodStart: new Date('2026-07-25T00:00:00.000Z'),
  periodEnd: USER_ALLOWANCE_PERIOD_END,
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
        operationType: UsageOperationType.AI_CHAT_TOKEN,
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

  it('names every resource when the exhausted limit spans them all', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        counter: buildLimitCounter({
          resourceType: UsageResourceType.ALL,
          operationTypes: [UsageOperationType.ALL],
          spenderType: 'application',
          spenderId: 'application-1',
        }),
      }),
    ).toMatchObject({
      resourceType: UsageResourceType.ALL,
      operationType: UsageOperationType.ALL,
    });
  });

  it('marks a scope built from a default counter', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        counter: buildLimitCounter({ isDefault: true }),
      }),
    ).toMatchObject({ exhaustedKind: 'limit', isDefault: true });
  });

  it('scopes an exhausted allowance counter to the whole workspace', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        counter: workspaceAllowanceCounter,
      }),
    ).toEqual({
      resourceType: UsageResourceType.AI,
      limitKind: 'quota',
      exhaustedKind: 'workspaceAllowance',
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

  it('scopes an exhausted user allowance counter to the member until the week ends', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        counter: userAllowanceCounter,
      }),
    ).toEqual({
      resourceType: UsageResourceType.AI,
      limitKind: 'quota',
      exhaustedKind: 'userAllowance',
      spenderType: 'userWorkspace',
      spenderId: 'user-workspace-1',
      operationType: UsageOperationType.ALL,
      unit: UsageUnit.USER_CREDIT,
      limitValue: 3_000_000,
      remaining: 0,
      periodCount: 1,
      periodUnit: 'week',
      retryAfterMs: USER_ALLOWANCE_PERIOD_END.getTime() - NOW.getTime(),
      isDefault: true,
    });
  });

  it('clamps the retry delay to zero once the period has ended', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        counter: buildLimitCounter({
          periodEnd: new Date('2026-08-10T00:00:00.000Z'),
        }),
      }),
    ).toMatchObject({ retryAfterMs: 0 });
  });

  it('reports the charge operation for a counter over several operations', () => {
    expect(
      buildQuotaExhaustedScope({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.WEB_SEARCH,
        counter: buildLimitCounter({
          operationTypes: [
            UsageOperationType.AI_CHAT_TOKEN,
            UsageOperationType.WEB_SEARCH,
          ],
        }),
      }),
    ).toMatchObject({ operationType: UsageOperationType.WEB_SEARCH });
  });
});
