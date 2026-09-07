/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import {
  EmailGroupAccessException,
  EmailGroupAccessExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/email-group-access.exception';
import { COMMUNITY_EMAILING_DOMAIN_DRIVERS } from 'src/engine/core-modules/emailing-domain/constants/community-emailing-domain-drivers.constant';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class EmailGroupAccessService {
  constructor(
    private readonly billingService: BillingService,
    private readonly enterprisePlanService: EnterprisePlanService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  validateEmailGroupAccessOrThrow(): void {
    if (this.billingService.isBillingEnabled()) {
      return;
    }

    if (
      COMMUNITY_EMAILING_DOMAIN_DRIVERS.includes(
        this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER'),
      )
    ) {
      return;
    }

    if (!this.enterprisePlanService.isValid()) {
      throw new EmailGroupAccessException(
        'Email group requires an Enterprise plan',
        EmailGroupAccessExceptionCode.EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED,
      );
    }
  }
}
