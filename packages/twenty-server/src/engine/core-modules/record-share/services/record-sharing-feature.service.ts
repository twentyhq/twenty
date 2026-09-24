/* @license Enterprise */

import { isLegacyRecordAccessOpen } from 'src/engine/core-modules/record-share/utils/is-legacy-record-access-open.util';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { NoRecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/services/no-record-sharing-entitlement-provider.service';
import { findRecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/utils/find-record-sharing-entitlement-provider.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingFeatureService implements OnModuleInit {
  private readonly logger = new Logger(RecordSharingFeatureService.name);

  private entitlementProvider: RecordSharingEntitlementProvider;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  onModuleInit() {
    const discoveredProvider = findRecordSharingEntitlementProvider(
      this.discoveryService,
    );

    if (!isDefined(discoveredProvider)) {
      this.logger.warn(
        'No record sharing entitlement provider is registered, record sharing stays off for every workspace on this instance.',
      );
    }

    this.entitlementProvider =
      discoveredProvider ?? new NoRecordSharingEntitlementProvider();
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
    return !(await this.isRecordSharingEnabled(workspaceId));
  }
}
