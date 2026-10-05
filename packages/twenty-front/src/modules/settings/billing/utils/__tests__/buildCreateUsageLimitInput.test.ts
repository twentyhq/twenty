import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildCreateUsageLimitInput } from '@/settings/billing/utils/buildCreateUsageLimitInput';
import {
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

const buildValues = (
  overrides: Partial<UsageLimitFormValues> = {},
): UsageLimitFormValues => ({
  ...EMPTY_USAGE_LIMIT_FORM_VALUES,
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'workspace',
  unit: UsageUnit.CREDIT,
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
    expect(buildCreateUsageLimitInput(buildValues({ unit: null }))).toBeNull();
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
      unit: UsageUnit.CREDIT,
      limitValue: 12_500_000,
      burstValue: null,
    });
  });

  it('rounds a count to a whole number', () => {
    expect(
      buildCreateUsageLimitInput(
        buildValues({
          operationType: UsageOperationType.WEB_SEARCH,
          unit: UsageUnit.INVOCATION,
          limitValue: '200',
        }),
      ),
    ).toEqual(
      expect.objectContaining({ limitValue: 200, unit: UsageUnit.INVOCATION }),
    );
    expect(
      buildCreateUsageLimitInput(
        buildValues({ unit: UsageUnit.INVOCATION, limitValue: '2.4' }),
      )?.limitValue,
    ).toBe(2);
  });

  it('rejects an amount that is not a positive number', () => {
    for (const limitValue of ['', 'abc', '-5', '0', '1e30']) {
      expect(
        buildCreateUsageLimitInput(buildValues({ limitValue })),
      ).toBeNull();
    }
  });

  it('rejects an amount too small to store', () => {
    expect(
      buildCreateUsageLimitInput(buildValues({ limitValue: '0.0000001' })),
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
