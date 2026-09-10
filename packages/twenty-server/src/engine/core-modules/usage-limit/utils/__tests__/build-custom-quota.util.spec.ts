import { buildCustomQuota } from 'src/engine/core-modules/usage-limit/utils/build-custom-quota.util';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const MONTH_PERIOD = {
  periodStart: new Date('2026-09-01T00:00:00.000Z'),
  periodEnd: new Date('2026-10-01T00:00:00.000Z'),
};

const buildUsageLimit = (
  overrides: Partial<UsageLimitEntity> = {},
): UsageLimitEntity =>
  ({
    id: 'limit-1',
    workspaceId: 'workspace-1',
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'quota',
    periodCount: 1,
    periodUnit: 'month',
    meter: 'creditsUsedMicro',
    limitValue: 1_000_000,
    burstValue: null,
    ...overrides,
  }) as UsageLimitEntity;

describe('buildCustomQuota', () => {
  it('carries the consumption and the period of the counter', () => {
    expect(
      buildCustomQuota({
        usageLimit: buildUsageLimit(),
        isEnforced: true,
        consumption: {
          consumedValue: 250_000,
          remainingValue: 750_000,
          ...MONTH_PERIOD,
        },
        spenderLabel: null,
      }),
    ).toEqual(
      expect.objectContaining({
        id: 'limit-1',
        spenderId: null,
        consumedValue: 250_000,
        remainingValue: 750_000,
        periodEnd: MONTH_PERIOD.periodEnd,
        isEnforced: true,
      }),
    );
  });

  it('leaves consumption and period empty when the counter was not read', () => {
    const item = buildCustomQuota({
      usageLimit: buildUsageLimit(),
      isEnforced: false,
      consumption: undefined,
      spenderLabel: null,
    });

    expect(item).toEqual(
      expect.objectContaining({
        isEnforced: false,
        consumedValue: null,
        remainingValue: null,
        periodStart: null,
        periodEnd: null,
      }),
    );
  });

  it('exposes the spender id and its label when the limit targets one spender', () => {
    expect(
      buildCustomQuota({
        usageLimit: buildUsageLimit({
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
        isEnforced: true,
        consumption: undefined,
        spenderLabel: 'Tim Apple',
      }),
    ).toEqual(
      expect.objectContaining({
        spenderId: 'user-1',
        spenderLabel: 'Tim Apple',
      }),
    );
  });
});
