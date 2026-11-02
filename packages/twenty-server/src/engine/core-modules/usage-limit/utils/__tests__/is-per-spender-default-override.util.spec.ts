import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { isPerSpenderDefaultOverride } from 'src/engine/core-modules/usage-limit/utils/is-per-spender-default-override.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const userCreditScope = buildUsageLimitScope({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'userWorkspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'week',
  unit: UsageUnit.USER_CREDIT,
});

describe('isPerSpenderDefaultOverride', () => {
  it('recognizes a row overriding the per-member AI credit default', () => {
    expect(isPerSpenderDefaultOverride(userCreditScope)).toBe(true);
  });

  it('does not flag a row scoped to one member', () => {
    expect(
      isPerSpenderDefaultOverride({
        ...userCreditScope,
        spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      }),
    ).toBe(false);
  });

  it('does not flag a row overriding a workspace-wide default', () => {
    expect(
      isPerSpenderDefaultOverride(
        buildUsageLimitScope({
          resourceType: UsageResourceType.STORAGE,
          operationType: UsageOperationType.STORAGE_FILE,
          spenderType: 'workspace',
          spenderId: '',
          limitKind: 'stock',
          periodCount: 1,
          periodUnit: 'lifetime',
          unit: UsageUnit.BYTE,
        }),
      ),
    ).toBe(false);
  });
});
