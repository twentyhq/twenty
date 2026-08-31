import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type UsageLimitRules } from 'src/engine/core-modules/usage-limit/types/usage-limit-rules.type';
import { fromUsageLimitEntityToFlat } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-flat.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const USAGE_LIMIT_RULES_ROWS_REQUIREMENT = {
  usageLimit: true,
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('usageLimitRules', { packingPonderation: 1 })
export class UsageLimitRulesCacheService extends WorkspaceCacheProvider<UsageLimitRules> {
  override readonly rowsRequirement = USAGE_LIMIT_RULES_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof USAGE_LIMIT_RULES_ROWS_REQUIREMENT
  >): UsageLimitRules {
    const { usageLimit: usageLimits } = rows;

    return usageLimits.reduce<UsageLimitRules>(
      (rules, usageLimit) => {
        const flat = fromUsageLimitEntityToFlat(usageLimit);

        rules.byResourceType[flat.resourceType] = [
          ...(rules.byResourceType[flat.resourceType] ?? []),
          flat,
        ];

        return rules;
      },
      { byResourceType: {} },
    );
  }
}
