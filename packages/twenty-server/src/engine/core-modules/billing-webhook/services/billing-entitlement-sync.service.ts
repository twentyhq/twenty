/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-entitlement-state-lock-options.constant';
import { buildBillingEntitlementStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-entitlement-state-lock-key.util';
import { buildBillingEntitlementsFromLookupKeys } from 'src/engine/core-modules/billing/utils/build-billing-entitlements-from-lookup-keys.util';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type EntitlementTransitionArgs = {
  workspaceId: string;
  stripeCustomerId: string;
  activeLookupKeys: string[];
};

type SyncedEntitlement = { key: BillingEntitlementKey; value: boolean };

@Injectable()
export class BillingEntitlementSyncService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: WorkspaceScopedRepository<BillingEntitlementEntity>,
    private readonly rowLevelPermissionPredicateGroupService: RowLevelPermissionPredicateGroupService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async syncEntitlements({
    workspaceId,
    stripeCustomerId,
    activeLookupKeys,
  }: EntitlementTransitionArgs): Promise<SyncedEntitlement[]> {
    // Serialized so a revoke's predicate delete never lands after a concurrent grant commits; this service is the rows' only writer
    return await this.cacheLockService.withLock(
      () =>
        this.applyEntitlementTransition({
          workspaceId,
          stripeCustomerId,
          activeLookupKeys,
        }),
      buildBillingEntitlementStateLockKey(workspaceId),
      BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS,
    );
  }

  private async applyEntitlementTransition({
    workspaceId,
    stripeCustomerId,
    activeLookupKeys,
  }: EntitlementTransitionArgs): Promise<SyncedEntitlement[]> {
    const billingEntitlements = buildBillingEntitlementsFromLookupKeys({
      workspaceId,
      stripeCustomerId,
      activeLookupKeys,
    });

    const isGranted = (key: BillingEntitlementKey) =>
      billingEntitlements.find((entitlement) => entitlement.key === key)
        ?.value === true;

    await this.billingEntitlementRepository.upsert(
      workspaceId,
      billingEntitlements,
      {
        conflictPaths: ['workspaceId', 'key'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'billingEntitlements',
    ]);

    // After the commit so a failure fails closed (rows stay filtered); checked every pass so a failed cleanup retries
    if (!isGranted(BillingEntitlementKey.RLS)) {
      await this.rowLevelPermissionPredicateGroupService.deleteAllRowLevelPermissionPredicateGroups(
        workspaceId,
      );
    }

    return billingEntitlements.map(({ key, value }) => ({ key, value }));
  }
}
