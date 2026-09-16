import { type DiscoveryService } from '@nestjs/core';

import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';
import { findProviderInstance } from 'src/engine/core-modules/usage-limit/utils/find-provider-instance.util';

export const findRecordSharingEntitlementProvider = (
  discoveryService: DiscoveryService,
): RecordSharingEntitlementProvider | null =>
  findProviderInstance({
    discoveryService,
    providerClass: RecordSharingEntitlementProvider,
  });
