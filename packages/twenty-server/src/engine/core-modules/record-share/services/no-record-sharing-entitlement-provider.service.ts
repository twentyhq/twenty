import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';

// Only reached when no provider was registered, which is a misconfiguration:
// denying keeps a paid feature from unlocking on an instance that cannot check
// the entitlement, rather than granting it silently.
export class NoRecordSharingEntitlementProvider extends RecordSharingEntitlementProvider {
  async hasRecordSharingEntitlement(): Promise<boolean> {
    return false;
  }
}
