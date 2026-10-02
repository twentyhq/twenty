import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { findAllowedUsageLimitUnits } from 'src/engine/core-modules/usage-limit/utils/find-allowed-usage-limit-units.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

describe('findAllowedUsageLimitUnits', () => {
  it('lets a quota on every operation count credits only', () => {
    expect(
      findAllowedUsageLimitUnits({
        limitKind: 'quota',
        definition: USAGE_LIMIT_DEFINITIONS[UsageResourceType.AI].quota,
        operationType: UsageOperationType.ALL,
      }),
    ).toEqual([UsageUnit.CREDIT]);
  });

  it('allows no unit to a speed limit on every operation', () => {
    expect(
      findAllowedUsageLimitUnits({
        limitKind: 'speed',
        definition: USAGE_LIMIT_DEFINITIONS[UsageResourceType.EMAIL].speed,
        operationType: UsageOperationType.ALL,
      }),
    ).toEqual([]);
  });

  it('allows no unit to a stock on every operation', () => {
    expect(
      findAllowedUsageLimitUnits({
        limitKind: 'stock',
        definition: USAGE_LIMIT_DEFINITIONS[UsageResourceType.STORAGE].stock,
        operationType: UsageOperationType.ALL,
      }),
    ).toEqual([]);
  });

  it('returns the units the definition lists for one operation', () => {
    expect(
      findAllowedUsageLimitUnits({
        limitKind: 'quota',
        definition:
          USAGE_LIMIT_DEFINITIONS[UsageResourceType.LOGIC_FUNCTION].quota,
        operationType: UsageOperationType.CODE_EXECUTION,
      }),
    ).toEqual([UsageUnit.CREDIT, UsageUnit.INVOCATION, UsageUnit.MILLISECOND]);
  });

  it('allows no unit to an operation the definition does not list', () => {
    expect(
      findAllowedUsageLimitUnits({
        limitKind: 'quota',
        definition: USAGE_LIMIT_DEFINITIONS[UsageResourceType.AI].quota,
        operationType: UsageOperationType.EMAIL_SEND,
      }),
    ).toEqual([]);
  });
});
