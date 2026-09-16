/* @license Enterprise */

import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { workspaceDataContextStorage } from 'src/engine/workspace-cache/storage/workspace-data-context.storage';

export const getWorkspaceBillingEntitlements = (
  workspaceId: string,
  workspaceCacheService: Pick<WorkspaceCacheService, 'getOrRecompute'>,
): Promise<BillingEntitlements> => {
  const context = workspaceDataContextStorage.getStore();
  const isCurrentWorkspace = context?.workspaceId === workspaceId;

  if (isCurrentWorkspace && context.billingEntitlements) {
    return context.billingEntitlements;
  }

  const entitlementsPromise = workspaceCacheService
    .getOrRecompute(workspaceId, ['billingEntitlements'])
    .then(({ billingEntitlements }) => billingEntitlements)
    .catch((error: unknown) => {
      if (
        isCurrentWorkspace &&
        context.billingEntitlements === entitlementsPromise
      ) {
        context.billingEntitlements = undefined;
      }

      throw error;
    });

  if (isCurrentWorkspace) {
    context.billingEntitlements = entitlementsPromise;
  }

  return entitlementsPromise;
};
