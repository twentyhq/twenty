import { isLegacyRecordAccessOpen } from 'src/engine/core-modules/record-share/utils/is-legacy-record-access-open.util';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { FeatureFlagKey } from 'twenty-shared/types';

import { type RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { NoRecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/services/no-record-sharing-entitlement-provider.service';
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
    const discoveredProvider = findRecordSharingEntitlementProvider(
      this.discoveryService,
    );

    this.entitlementProvider =
      discoveredProvider ?? new NoRecordSharingEntitlementProvider();
  }

  async isRecordSharingEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );
    return featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] ?? false;
  }

  async isLegacyRecordAccessOpen(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    if (
      !isLegacyRecordAccessOpen({
        flatObjectMetadataMaps,
        wasRecordSharingEnabled: false,
      })
    )
      return false;
    return !(
      (await this.isRecordSharingEnabled(workspaceId)) &&
      (await this.entitlementProvider.hasRecordSharingEntitlement(workspaceId))
    );
  }
}
