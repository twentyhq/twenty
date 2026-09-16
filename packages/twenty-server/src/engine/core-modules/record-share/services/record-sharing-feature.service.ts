/* @license Enterprise */

import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { FeatureFlagKey } from 'twenty-shared/types';

import { type RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { findRecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/utils/find-record-sharing-entitlement-provider.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingFeatureService implements OnModuleInit {
  private entitlementProvider: RecordSharingEntitlementProvider;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  onModuleInit() {
    this.entitlementProvider = findRecordSharingEntitlementProvider(
      this.discoveryService,
    );
  }

  async isRecordSharingEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (!featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED]) {
      return false;
    }

    return this.entitlementProvider.hasRecordSharingEntitlement(workspaceId);
  }
}
