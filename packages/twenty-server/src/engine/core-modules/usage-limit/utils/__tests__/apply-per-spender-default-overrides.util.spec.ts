import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { applyPerSpenderDefaultOverrides } from 'src/engine/core-modules/usage-limit/utils/apply-per-spender-default-overrides.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const userCreditDefault: QuotaLimitDefault = {
  resourceType: UsageResourceType.AI,
  operationTypes: [
    UsageOperationType.AI_CHAT_TOKEN,
    UsageOperationType.WEB_SEARCH,
  ],
  limitKind: 'quota',
  spenderType: 'userWorkspace',
  spenderId: '',
  isPerSpender: true,
  unit: UsageUnit.USER_CREDIT,
  periodUnit: 'week',
  periodCount: 1,
  isOverridable: true,
  limitValue: 5_000_000,
};

const workspaceCreditDefault: QuotaLimitDefault = {
  ...userCreditDefault,
  operationTypes: [UsageOperationType.AI_CHAT_TOKEN],
  spenderType: 'workspace',
  isPerSpender: false,
  unit: UsageUnit.CREDIT,
  periodUnit: 'month',
};

const buildLimit = (overrides: Partial<FlatQuotaLimit>): FlatQuotaLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'userWorkspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'week',
  unit: UsageUnit.USER_CREDIT,
  limitValue: 0,
  burstValue: null,
  isInstanceOverride: true,
  ...overrides,
});

describe('applyPerSpenderDefaultOverrides', () => {
  it('moves the value of an overriding row into the per-member default and drops the row', () => {
    const overridingLimit = buildLimit({ limitValue: 0 });
    const otherLimit = buildLimit({
      id: 'limit-2',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
      limitValue: 1_000_000,
    });

    expect(
      applyPerSpenderDefaultOverrides({
        quotaLimitDefaults: [userCreditDefault],
        quotaLimits: [overridingLimit, otherLimit],
      }),
    ).toEqual({
      quotaLimitDefaults: [{ ...userCreditDefault, limitValue: 0 }],
      quotaLimits: [otherLimit],
    });
  });

  it('gives the row value to a per-member default that has no configured value', () => {
    const overridingLimit = buildLimit({ limitValue: 3_000_000 });

    expect(
      applyPerSpenderDefaultOverrides({
        quotaLimitDefaults: [{ ...userCreditDefault, limitValue: null }],
        quotaLimits: [overridingLimit],
      }),
    ).toEqual({
      quotaLimitDefaults: [{ ...userCreditDefault, limitValue: 3_000_000 }],
      quotaLimits: [],
    });
  });

  it('drops a default that has no configured value and no overriding row', () => {
    expect(
      applyPerSpenderDefaultOverrides({
        quotaLimitDefaults: [{ ...userCreditDefault, limitValue: null }],
        quotaLimits: [],
      }),
    ).toEqual({ quotaLimitDefaults: [], quotaLimits: [] });
  });

  it('leaves the default untouched when no row overrides it', () => {
    const otherLimit = buildLimit({ unit: UsageUnit.CREDIT });

    expect(
      applyPerSpenderDefaultOverrides({
        quotaLimitDefaults: [userCreditDefault],
        quotaLimits: [otherLimit],
      }),
    ).toEqual({
      quotaLimitDefaults: [userCreditDefault],
      quotaLimits: [otherLimit],
    });
  });

  it('keeps the row for a default that is not per member, which the row replaces as before', () => {
    const workspaceLimit = buildLimit({
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
    });

    expect(
      applyPerSpenderDefaultOverrides({
        quotaLimitDefaults: [workspaceCreditDefault],
        quotaLimits: [workspaceLimit],
      }),
    ).toEqual({
      quotaLimitDefaults: [workspaceCreditDefault],
      quotaLimits: [workspaceLimit],
    });
  });
});
