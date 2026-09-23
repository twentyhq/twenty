import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildUsageQuotaScopeInput } from '@/settings/billing/utils/buildUsageQuotaScopeInput';
import {
  UsageOperationType,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const buildValues = (
  overrides: Partial<UsageLimitFormValues> = {},
): UsageLimitFormValues => ({
  ...EMPTY_USAGE_LIMIT_FORM_VALUES,
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'workspace',
  meter: 'creditsUsedMicro',
  periodUnit: 'month',
  limitValue: '100',
  ...overrides,
});

describe('buildUsageQuotaScopeInput', () => {
  it('returns null while the scope is incomplete', () => {
    expect(buildUsageQuotaScopeInput(EMPTY_USAGE_LIMIT_FORM_VALUES)).toBeNull();
    expect(
      buildUsageQuotaScopeInput(buildValues({ periodUnit: null })),
    ).toBeNull();
  });

  it('builds the scope whatever the amount is worth', () => {
    const scope = {
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      spenderType: 'workspace',
      spenderId: null,
      meter: 'creditsUsedMicro',
      periodUnit: 'month',
    };

    expect(buildUsageQuotaScopeInput(buildValues({ limitValue: '' }))).toEqual(
      scope,
    );
    expect(buildUsageQuotaScopeInput(buildValues({ limitValue: '0' }))).toEqual(
      scope,
    );
  });

  it('only keeps a spender id for a spender narrower than the workspace', () => {
    expect(
      buildUsageQuotaScopeInput(
        buildValues({ spenderType: 'userWorkspace', spenderId: '  user-1  ' }),
      )?.spenderId,
    ).toBe('user-1');
    expect(
      buildUsageQuotaScopeInput(buildValues({ spenderId: 'ignored' }))
        ?.spenderId,
    ).toBeNull();
  });
});
