import { buildUsageLimitFormValues } from '@/settings/billing/utils/buildUsageLimitFormValues';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import {
  UsageOperationType,
  UsageResourceType,
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
  meter: 'creditsUsedMicro',
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
      meter: 'creditsUsedMicro',
      periodUnit: 'month',
      limitValue: '100',
    });
  });

  it('keeps a quantity quota as it is stored and carries the spender id', () => {
    expect(
      buildUsageLimitFormValues(
        buildItem({
          meter: 'quantity',
          limitValue: 200,
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        limitValue: '200',
        spenderId: 'user-1',
      }),
    );
  });
});
