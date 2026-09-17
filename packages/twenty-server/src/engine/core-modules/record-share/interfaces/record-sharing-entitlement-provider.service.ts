import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RecordSharingEntitlementProvider {
  abstract hasRecordSharingEntitlement(workspaceId: string): Promise<boolean>;
}
