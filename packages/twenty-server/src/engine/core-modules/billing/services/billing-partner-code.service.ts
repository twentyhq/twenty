/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPartnerCodeDTO } from 'src/engine/core-modules/billing/dtos/billing-partner-code.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingPartnerCodeService {
  protected readonly logger = new Logger(BillingPartnerCodeService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  async getPartnerCode(workspaceId: string): Promise<BillingPartnerCodeDTO> {
    const stripeCustomerId = await this.getStripeCustomerIdOrThrow(workspaceId);

    const [partnerCode, hasPaidInvoice] = await Promise.all([
      this.stripeCustomerService.getCustomerPartner(stripeCustomerId),
      this.stripeInvoiceService.hasPaidInvoice(stripeCustomerId),
    ]);

    return { partnerCode, isEditable: !hasPaidInvoice };
  }

  // Last code wins until the first payment; after it only the Twenty team changes it, in Stripe.
  async setPartnerCode({
    workspaceId,
    partnerCode,
  }: {
    workspaceId: string;
    partnerCode: string;
  }): Promise<BillingPartnerCodeDTO> {
    const normalizedPartnerCode = normalizePartner(partnerCode);

    if (
      !isDefined(normalizedPartnerCode) ||
      !(await this.doesPartnerCodeExist(normalizedPartnerCode))
    ) {
      throw new BillingException(
        `Partner code ${partnerCode} not found`,
        BillingExceptionCode.BILLING_PARTNER_CODE_NOT_FOUND,
      );
    }

    const stripeCustomerId = await this.getStripeCustomerIdOrThrow(workspaceId);

    if (await this.stripeInvoiceService.hasPaidInvoice(stripeCustomerId)) {
      throw new BillingException(
        `Partner code of workspace ${workspaceId} is locked after the first payment`,
        BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
      );
    }

    await this.stripeCustomerService.updateCustomerPartner(
      stripeCustomerId,
      normalizedPartnerCode,
    );

    return { partnerCode: normalizedPartnerCode, isEditable: true };
  }

  private async getStripeCustomerIdOrThrow(workspaceId: string) {
    const billingCustomer = await this.billingCustomerRepository.findOne(
      workspaceId,
      { where: {} },
    );

    if (!isDefined(billingCustomer)) {
      throw new BillingException(
        `No billing customer found for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    return billingCustomer.stripeCustomerId;
  }

  // Fails open: an unknown code lands in Unmatched Referrals on the partners side.
  private async doesPartnerCodeExist(partnerCode: string): Promise<boolean> {
    const checkUrl = this.twentyConfigService.get(
      'BILLING_PARTNER_CODE_CHECK_URL',
    );

    if (!isNonEmptyString(checkUrl)) {
      return true;
    }

    try {
      const { data } = await this.secureHttpClientService
        .getHttpClient()
        .get<{ exists?: boolean }>(checkUrl, {
          params: { code: partnerCode },
        });

      return data.exists === true;
    } catch (error) {
      this.logger.warn(
        `Partner code check failed, accepting ${partnerCode}: ${error}`,
      );

      return true;
    }
  }
}
