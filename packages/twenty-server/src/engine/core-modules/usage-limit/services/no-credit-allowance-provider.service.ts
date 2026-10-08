import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export class NoCreditAllowanceProvider extends CreditAllowanceProvider {
  async isCreditAllowanceEnabled(): Promise<boolean> {
    return false;
  }

  async getCreditAllowancePeriod(): Promise<UsagePeriod | null> {
    return null;
  }

  async getCreditAllowance(): Promise<CreditAllowance | null> {
    return null;
  }
}
