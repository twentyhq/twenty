import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';
import {
  buildUsageLimitScope,
  type UsageLimitScope,
} from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildQuotaScope = (
  overrides: Partial<UsageLimitScope> = {},
): UsageLimitScope =>
  buildUsageLimitScope({
    resourceType: UsageResourceType.EMAIL,
    operationType: UsageOperationType.EMAIL_SEND,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'quota',
    periodCount: 1,
    periodUnit: 'day',
    unit: UsageUnit.INVOCATION,
    ...overrides,
  });

describe('findSuppressedUsageLimitDefaults', () => {
  it('returns the default the row replaces', () => {
    const suppressed = findSuppressedUsageLimitDefaults(buildQuotaScope());

    expect(suppressed.map((entry) => entry.limitValueConfigVariable)).toEqual([
      'EMAIL_SEND_WORKSPACE_DAILY_LIMIT',
    ]);
  });

  it('returns nothing when the row replaces no default', () => {
    expect(
      findSuppressedUsageLimitDefaults(
        buildQuotaScope({ periodUnit: 'month' }),
      ),
    ).toEqual([]);
  });

  it('returns nothing for a resource that declares no default', () => {
    expect(
      findSuppressedUsageLimitDefaults(
        buildQuotaScope({
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          periodUnit: 'month',
          unit: UsageUnit.CREDIT,
        }),
      ),
    ).toEqual([]);
  });

  it('declares at most one overridable default per suppressible scope', () => {
    const overridableDefaults = Object.values(UsageResourceType)
      .flatMap((resourceType) => findUsageLimitDefaults({ resourceType }))
      .filter((usageLimitDefault) => usageLimitDefault.isOverridable);

    const defaultsSharingAScope = overridableDefaults.filter(
      (usageLimitDefault) =>
        overridableDefaults.some(
          (otherDefault) =>
            otherDefault !== usageLimitDefault &&
            doesUsageLimitRowSuppressDefault({
              scope: usageLimitDefault,
              usageLimitDefault: otherDefault,
            }),
        ),
    );

    expect(defaultsSharingAScope).toEqual([]);
  });
});
