import { type UsageLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-default-definition.type';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';

export const findSuppressedUsageLimitDefaults = (
  scope: UsageLimitScope,
): UsageLimitDefaultDefinition[] =>
  findUsageLimitDefaults({ resourceType: scope.resourceType }).filter(
    (usageLimitDefault) =>
      doesUsageLimitRowSuppressDefault({ scope, usageLimitDefault }),
  );
