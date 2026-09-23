import { type UsageLimitDefault } from 'src/engine/core-modules/usage-limit/types/usage-limit-default.type';
import { buildUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-defaults.util';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';

// A scope can face several declared defaults at once, so this answers with every
// one it replaces rather than the first match.
export const findSuppressedUsageLimitDefaults = (
  scope: UsageLimitScope,
): UsageLimitDefault[] =>
  buildUsageLimitDefaults({ resourceType: scope.resourceType }).filter(
    (usageLimitDefault) =>
      doesUsageLimitRowSuppressDefault({ scope, usageLimitDefault }),
  );
