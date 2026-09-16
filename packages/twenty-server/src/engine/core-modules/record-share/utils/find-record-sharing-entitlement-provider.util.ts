import { type DiscoveryService } from '@nestjs/core';

import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { NoRecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/services/no-record-sharing-entitlement-provider.service';
import { findProviderInstance } from 'src/engine/core-modules/usage-limit/utils/find-provider-instance.util';

export const findRecordSharingEntitlementProvider = (
  discoveryService: DiscoveryService,
): RecordSharingEntitlementProvider =>
  findProviderInstance({
    discoveryService,
    providerClass: RecordSharingEntitlementProvider,
  }) ?? new NoRecordSharingEntitlementProvider();
