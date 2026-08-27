import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { fromUsageLimitEntityToFlat } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-flat.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type UsageLimitRules } from 'src/engine/core-modules/usage-limit/types/usage-limit-rules.type';

@Injectable()
@WorkspaceCache('usageLimitRules', { packingPonderation: 1 })
export class UsageLimitRulesCacheService extends WorkspaceCacheProvider<UsageLimitRules> {
  constructor(
    @InjectWorkspaceScopedRepository(UsageLimitEntity)
    private readonly usageLimitRepository: WorkspaceScopedRepository<UsageLimitEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<UsageLimitRules> {
    const usageLimits = await this.usageLimitRepository.find(workspaceId);

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
