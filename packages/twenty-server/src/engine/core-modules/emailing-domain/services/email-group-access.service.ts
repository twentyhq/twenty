/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { isCommunityEmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/utils/is-community-emailing-domain-driver.util';
import {
  EmailGroupAccessException,
  EmailGroupAccessExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/email-group-access.exception';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Cloud instances (billing enabled) meter usage with credits at send time,
// so access itself is unrestricted there. Self-hosted instances get the
// feature with the community RESEND driver (or LOG for local development);
// the AWS SES and Mailgun drivers additionally require a valid Enterprise
// plan, enforced when the driver is created.
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

    const emailingDomainDriver = this.twentyConfigService.get(
      'EMAILING_DOMAIN_DRIVER',
    );

    if (isCommunityEmailingDomainDriver(emailingDomainDriver)) {
      return;
    }

    if (!this.enterprisePlanService.isValid()) {
      throw new EmailGroupAccessException(
        'Email group with this driver requires an Enterprise plan',
        EmailGroupAccessExceptionCode.EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED,
      );
    }
  }
}
