/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class BillingEntitlementService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async getWorkspaceEntitlements(
    workspaceId: string,
  ): Promise<BillingEntitlements> {
    const authContext = workspaceAuthContextStorage.getStore();
    const isCurrentWorkspace = authContext?.workspace.id === workspaceId;

    if (isCurrentWorkspace && isDefined(authContext.billingEntitlements)) {
      return authContext.billingEntitlements;
    }

    const { billingEntitlements } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'billingEntitlements',
      ]);

    if (isCurrentWorkspace) {
      authContext.billingEntitlements = billingEntitlements;
    }

    return billingEntitlements;
  }

  async invalidateWorkspaceEntitlements(workspaceId: string): Promise<void> {
    const authContext = workspaceAuthContextStorage.getStore();

    if (authContext?.workspace.id === workspaceId) {
      delete authContext.billingEntitlements;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'billingEntitlements',
    ]);
  }
}
