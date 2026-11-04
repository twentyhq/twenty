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

    return this.getPartnerCodeOfStripeCustomer(stripeCustomerId);
  }

  // Once a code is set or the workspace has paid, only the Twenty team changes it, in Stripe.
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

    const { isEditable } =
      await this.getPartnerCodeOfStripeCustomer(stripeCustomerId);

    if (!isEditable) {
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

  private async getPartnerCodeOfStripeCustomer(
    stripeCustomerId: string,
  ): Promise<BillingPartnerCodeDTO> {
    const [partnerCode, hasPaidInvoice] = await Promise.all([
      this.stripeCustomerService.getCustomerPartner(stripeCustomerId),
      this.stripeInvoiceService.hasPaidInvoice(stripeCustomerId),
    ]);

    return {
      partnerCode,
      isEditable: !isDefined(partnerCode) && !hasPaidInvoice,
    };
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
