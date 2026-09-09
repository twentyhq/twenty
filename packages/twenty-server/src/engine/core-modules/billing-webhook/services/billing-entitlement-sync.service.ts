/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { buildBillingEntitlementStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-entitlement-state-lock-key.util';
import { buildBillingEntitlementsFromLookupKeys } from 'src/engine/core-modules/billing/utils/build-billing-entitlements-from-lookup-keys.util';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Shared by the Stripe webhook and the reconciliation command so a repaired
// entitlement carries the same consequences as one that arrived on time.
// Transitions are read from the stored rows rather than from Stripe's
// previous_attributes, which the reconciliation path never has.
@Injectable()
export class BillingEntitlementSyncService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: WorkspaceScopedRepository<BillingEntitlementEntity>,
    private readonly rowLevelPermissionPredicateGroupService: RowLevelPermissionPredicateGroupService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async syncEntitlements({
    workspaceId,
    stripeCustomerId,
    activeLookupKeys,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
    activeLookupKeys: string[];
  }): Promise<{ key: BillingEntitlementKey; value: boolean }[]> {
    // The whole transition is one unit. Reading the stored rows, acting on the
    // difference and committing it are three steps, and this service is the
    // only writer of those rows, so serializing here is what makes the
    // difference a transition rather than a guess about one.
    return await this.cacheLockService.withLock(
      () =>
        this.applyEntitlementTransition({
          workspaceId,
          stripeCustomerId,
          activeLookupKeys,
        }),
      buildBillingEntitlementStateLockKey(workspaceId),
    );
  }

  private async applyEntitlementTransition({
    workspaceId,
    stripeCustomerId,
    activeLookupKeys,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
    activeLookupKeys: string[];
  }): Promise<{ key: BillingEntitlementKey; value: boolean }[]> {
    const storedEntitlements =
      await this.billingEntitlementRepository.find(workspaceId);

    const wasGranted = (key: BillingEntitlementKey) =>
      storedEntitlements.find((entitlement) => entitlement.key === key)
        ?.value === true;

    const billingEntitlements = buildBillingEntitlementsFromLookupKeys({
      workspaceId,
      stripeCustomerId,
      activeLookupKeys,
    });

    const isGranted = (key: BillingEntitlementKey) =>
      billingEntitlements.find((entitlement) => entitlement.key === key)
        ?.value === true;

    // Counters accumulated while the limit was unenforced would otherwise be
    // charged against the workspace the moment the entitlement turns on. Done
    // before the rows are committed: a failure here then leaves the transition
    // unapplied and the next sync retries it, where committing first would make
    // every retry skip the reset and charge that usage.
    if (
      !wasGranted(BillingEntitlementKey.USAGE_LIMIT) &&
      isGranted(BillingEntitlementKey.USAGE_LIMIT)
    ) {
      await this.usageLimitQuotaService.dropIntraWorkspaceLimitCounters(
        workspaceId,
      );
    }

    await this.billingEntitlementRepository.upsert(
      workspaceId,
      billingEntitlements,
      {
        conflictPaths: ['workspaceId', 'key'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    // The opposite order to the reset above, because the unsafe direction is
    // reversed: predicates deleted while the row still grants RLS would leave
    // row filtering on with nothing to filter by. Query-time filtering reads
    // the predicate cache and never the entitlement, so committing the revoke
    // first is the direction that fails closed: a failure here leaves rows
    // filtered by predicates that outlived the feature, not unfiltered.
    // Asked on every pass rather than on the revoke transition, so a cleanup
    // that failed after the revoke committed is retried by the next sync.
    if (!isGranted(BillingEntitlementKey.RLS)) {
      await this.rowLevelPermissionPredicateGroupService.deleteAllRowLevelPermissionPredicateGroups(
        workspaceId,
      );
    }

    return billingEntitlements.map(({ key, value }) => ({ key, value }));
  }
}
