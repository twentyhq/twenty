import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';

export const isPerSpenderDefaultOverride = (scope: UsageLimitScope): boolean =>
  findSuppressedUsageLimitDefaults(scope).some(
    (usageLimitDefault) =>
      usageLimitDefault.limitKind === 'quota' && usageLimitDefault.isPerSpender,
  );
