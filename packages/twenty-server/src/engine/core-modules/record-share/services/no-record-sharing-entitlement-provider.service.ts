import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';

export class NoRecordSharingEntitlementProvider extends RecordSharingEntitlementProvider {
  async hasRecordSharingEntitlement(): Promise<boolean> {
    return false;
  }
}
