import { UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';

export class NoUsageLimitEntitlementProvider extends UsageLimitEntitlementProvider {
  async hasIntraWorkspaceLimitEntitlement(): Promise<boolean> {
    return true;
  }
}
