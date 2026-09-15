import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type UsageLimits } from 'src/engine/core-modules/usage-limit/types/usage-limits.type';
import { fromUsageLimitEntityToFlat } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-flat.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const USAGE_LIMITS_ROWS_REQUIREMENT = {
  usageLimit: true,
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('usageLimits', { packingPonderation: 1 })
export class UsageLimitsCacheService extends WorkspaceCacheProvider<UsageLimits> {
  override readonly rowsRequirement = USAGE_LIMITS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof USAGE_LIMITS_ROWS_REQUIREMENT
  >): UsageLimits {
    const { usageLimit: usageLimits } = rows;

    return usageLimits.reduce<UsageLimits>(
      (limits, usageLimit) => {
        const flat = fromUsageLimitEntityToFlat(usageLimit);

        limits.byResourceType[flat.resourceType] = [
          ...(limits.byResourceType[flat.resourceType] ?? []),
          flat,
        ];

        return limits;
      },
      { byResourceType: {} },
    );
  }
}
