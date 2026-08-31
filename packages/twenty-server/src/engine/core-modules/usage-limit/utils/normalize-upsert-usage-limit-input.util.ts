import { isDefined } from 'twenty-shared/utils';

import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';

// windowSeconds predates periodCount + periodUnit; a caller still sending it
// means a rolling window, recognizable because the new fields sit at their
// GraphQL defaults.
export const normalizeUpsertUsageLimitInput = (
  input: UpsertUsageLimitInput,
): UpsertUsageLimitInput => {
  const isLegacyRollingWindowInput =
    isDefined(input.windowSeconds) &&
    input.windowSeconds > 0 &&
    input.periodUnit === 'billingPeriod' &&
    input.periodCount === 1;

  if (!isLegacyRollingWindowInput) {
    return input;
  }

  return {
    ...input,
    periodCount: input.windowSeconds as number,
    periodUnit: 'second',
  };
};
