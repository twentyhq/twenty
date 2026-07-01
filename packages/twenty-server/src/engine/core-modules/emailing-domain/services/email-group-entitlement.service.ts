/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import {
  EmailGroupEntitlementException,
  EmailGroupEntitlementExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/email-group-entitlement.exception';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';

@Injectable()
export class EmailGroupEntitlementService {
  constructor(
    private readonly billingService: BillingService,
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  async hasEmailGroupEntitlement(workspaceId: string): Promise<boolean> {
    const hasValidEnterprisePlan = this.enterprisePlanService.isValid();

    const hasEmailGroupBillingEntitlement =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.EMAIL_GROUP,
      );

    return hasValidEnterprisePlan && hasEmailGroupBillingEntitlement;
  }

  async validateEmailGroupEntitlementOrThrow(
    workspaceId: string,
  ): Promise<void> {
    const hasEmailGroupEntitlement =
      await this.hasEmailGroupEntitlement(workspaceId);

    if (!hasEmailGroupEntitlement) {
      throw new EmailGroupEntitlementException(
        'Email group requires an Enterprise subscription',
        EmailGroupEntitlementExceptionCode.EMAIL_GROUP_ENTITLEMENT_REQUIRED,
      );
    }
  }
}
