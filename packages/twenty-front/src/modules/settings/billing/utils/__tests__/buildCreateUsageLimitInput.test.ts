import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildCreateUsageLimitInput } from '@/settings/billing/utils/buildCreateUsageLimitInput';
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

describe('buildCreateUsageLimitInput', () => {
  it('returns null while the scope is incomplete', () => {
    expect(
      buildCreateUsageLimitInput(EMPTY_USAGE_LIMIT_FORM_VALUES),
    ).toBeNull();
    expect(
      buildCreateUsageLimitInput(buildValues({ spenderType: null })),
    ).toBeNull();
  });

  it('always builds a one-period quota without burst', () => {
    expect(
      buildCreateUsageLimitInput(buildValues({ limitValue: '12.5' })),
    ).toEqual({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      spenderType: 'workspace',
      spenderId: null,
      limitKind: 'quota',
      periodCount: 1,
      periodUnit: 'month',
      meter: 'creditsUsedMicro',
      limitValue: 12_500_000,
      burstValue: null,
    });
  });

  it('keeps a quantity quota as an integer and rejects fractions', () => {
    expect(
      buildCreateUsageLimitInput(
        buildValues({
          operationType: UsageOperationType.WEB_SEARCH,
          meter: 'quantity',
          limitValue: '200',
        }),
      ),
    ).toEqual(expect.objectContaining({ limitValue: 200, meter: 'quantity' }));
    expect(
      buildCreateUsageLimitInput(
        buildValues({ meter: 'quantity', limitValue: '2.5' }),
      ),
    ).toBeNull();
  });

  it('only keeps a spender id for a spender narrower than the workspace', () => {
    expect(
      buildCreateUsageLimitInput(
        buildValues({ spenderType: 'userWorkspace', spenderId: '  user-1  ' }),
      )?.spenderId,
    ).toBe('user-1');
    expect(
      buildCreateUsageLimitInput(buildValues({ spenderId: 'ignored' }))
        ?.spenderId,
    ).toBeNull();
  });
});
