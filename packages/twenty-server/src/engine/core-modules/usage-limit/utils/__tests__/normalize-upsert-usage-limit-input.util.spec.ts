import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import { normalizeUpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/utils/normalize-upsert-usage-limit-input.util';

const baseInput: UpsertUsageLimitInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  limitKind: 'speed',
  periodCount: 1,
  periodUnit: 'billingPeriod',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 100,
};

describe('normalizeUpsertUsageLimitInput', () => {
  it('reads a legacy windowSeconds as a rolling period', () => {
    expect(
      normalizeUpsertUsageLimitInput({ ...baseInput, windowSeconds: 60 }),
    ).toMatchObject({ periodCount: 60, periodUnit: 'second' });
  });

  it('leaves an explicit period alone even when windowSeconds rides along', () => {
    expect(
      normalizeUpsertUsageLimitInput({
        ...baseInput,
        periodCount: 10,
        periodUnit: 'second',
        windowSeconds: 60,
      }),
    ).toMatchObject({ periodCount: 10, periodUnit: 'second' });
  });

  it('ignores the legacy zero that meant the billing period', () => {
    expect(
      normalizeUpsertUsageLimitInput({ ...baseInput, windowSeconds: 0 }),
    ).toMatchObject({ periodCount: 1, periodUnit: 'billingPeriod' });
  });
});
