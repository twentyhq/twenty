import { buildUsageLimitFormValues } from '@/settings/billing/utils/buildUsageLimitFormValues';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import {
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

const buildItem = (
  overrides: Partial<UsageQuotaWithConsumption> = {},
): UsageQuotaWithConsumption => ({
  __typename: 'UsageQuotaWithConsumption',
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: null,
  spenderLabel: null,
  periodUnit: 'month',
  unit: UsageUnit.CREDIT,
  limitValue: 100_000_000,
  isEnforced: true,
  consumedValue: null,
  remainingValue: null,
  periodStart: null,
  periodEnd: null,
  ...overrides,
});

describe('buildUsageLimitFormValues', () => {
  it('turns a credit quota back into whole credits', () => {
    expect(buildUsageLimitFormValues(buildItem())).toEqual({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      spenderId: '',
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
      limitValue: '100',
    });
  });

  it('keeps a count as it is stored and carries the spender id', () => {
    expect(
      buildUsageLimitFormValues(
        buildItem({
          unit: UsageUnit.TOKEN,
          limitValue: 200,
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        unit: UsageUnit.TOKEN,
        limitValue: '200',
        spenderId: 'user-1',
      }),
    );
  });

  it('turns a runtime stored in milliseconds back into minutes', () => {
    expect(
      buildUsageLimitFormValues(
        buildItem({
          resourceType: UsageResourceType.LOGIC_FUNCTION,
          operationType: UsageOperationType.CODE_EXECUTION,
          unit: UsageUnit.MILLISECOND,
          limitValue: 90_000,
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        unit: UsageUnit.MILLISECOND,
        limitValue: '1.5',
      }),
    );
  });
});
