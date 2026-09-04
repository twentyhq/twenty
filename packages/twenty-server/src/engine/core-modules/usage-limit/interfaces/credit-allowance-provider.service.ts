import { Injectable } from '@nestjs/common';

import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

@Injectable()
export abstract class CreditAllowanceProvider {
  abstract getCreditAllowancePeriod(
    workspaceId: string,
  ): Promise<UsagePeriod | null>;

  abstract getCreditAllowance(
    workspaceId: string,
  ): Promise<CreditAllowance | null>;
}
