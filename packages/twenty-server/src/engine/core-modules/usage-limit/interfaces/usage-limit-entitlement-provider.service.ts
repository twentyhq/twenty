import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class UsageLimitEntitlementProvider {
  abstract hasIntraWorkspaceLimitEntitlement(
    workspaceId: string,
  ): Promise<boolean>;
}
