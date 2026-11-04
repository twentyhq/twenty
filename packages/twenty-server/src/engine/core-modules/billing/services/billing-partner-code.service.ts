/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, normalizePartner } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPartnerCodeDTO } from 'src/engine/core-modules/billing/dtos/billing-partner-code.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingPartnerCodeService {
  constructor(
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

    return {
      partnerCode,
      isEditable: !isDefined(partnerCode) && !hasPaidInvoice,
    };
  }

  // A code can only be added while none is set and before the first payment; any later change is made by the Twenty team, in Stripe.
  async setPartnerCode({
    workspaceId,
    partnerCode,
  }: {
    workspaceId: string;
    partnerCode: string;
  }): Promise<BillingPartnerCodeDTO> {
    const normalizedPartnerCode = normalizePartner(partnerCode);

    // Unknown codes are accepted: the partners team matches them when recording referrals.
    if (!isDefined(normalizedPartnerCode)) {
      throw new BillingException(
        `Partner code ${partnerCode} is not valid`,
        BillingExceptionCode.BILLING_PARTNER_CODE_INVALID,
      );
    }

    const stripeCustomerId = await this.getStripeCustomerIdOrThrow(workspaceId);

    const [existingPartnerCode, hasPaidInvoice] = await Promise.all([
      this.stripeCustomerService.getCustomerPartner(stripeCustomerId),
      this.stripeInvoiceService.hasPaidInvoice(stripeCustomerId),
    ]);

    if (isDefined(existingPartnerCode) || hasPaidInvoice) {
      throw new BillingException(
        `Partner code of workspace ${workspaceId} is locked`,
        BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
      );
    }

    await this.stripeCustomerService.updateCustomerPartner(
      stripeCustomerId,
      normalizedPartnerCode,
    );

    return { partnerCode: normalizedPartnerCode, isEditable: false };
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
}
