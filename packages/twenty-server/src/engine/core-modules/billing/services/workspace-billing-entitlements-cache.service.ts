/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

@Injectable()
@WorkspaceCache('billingEntitlements', { packingPonderation: 1 })
export class WorkspaceBillingEntitlementsCacheService extends WorkspaceCacheProvider<BillingEntitlements> {
  constructor(
    @InjectWorkspaceScopedRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: WorkspaceScopedRepository<BillingEntitlementEntity>,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
  }: Pick<
    WorkspaceCacheProviderContext,
    'workspaceId'
  >): Promise<BillingEntitlements> {
    const entitlements = await this.billingEntitlementRepository.find(
      workspaceId,
      { select: { key: true, value: true } },
    );

    return entitlements.reduce<BillingEntitlements>(
      (entitlementsByKey, { key, value }) => {
        entitlementsByKey[key] = value;

        return entitlementsByKey;
      },
      {},
    );
  }
}
