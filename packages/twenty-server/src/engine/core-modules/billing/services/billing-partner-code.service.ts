/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { isDefined, normalizePartner } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPartnerCodeDTO } from 'src/engine/core-modules/billing/dtos/billing-partner-code.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingPartnerCodeService {
  constructor(
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  async getPartnerCode(workspaceId: string): Promise<BillingPartnerCodeDTO> {
    const stripeCustomerId = await this.getStripeCustomerIdOrThrow(workspaceId);

    const { partner } =
      await this.stripeCustomerService.getCustomerPartnerAndEmail(
        stripeCustomerId,
      );

    return {
      partnerCode: partner,
      isEditable:
        !isDefined(partner) &&
        (await this.isTrialingOrWithoutSubscription(workspaceId)),
    };
  }

  async setPartnerCode({
    workspaceId,
    partnerCode,
  }: {
    workspaceId: string;
    partnerCode: string;
  }): Promise<BillingPartnerCodeDTO> {
    const normalizedPartnerCode = normalizePartner(partnerCode);

    if (!isDefined(normalizedPartnerCode)) {
      throw new BillingException(
        `Partner code ${partnerCode} is not valid`,
        BillingExceptionCode.BILLING_PARTNER_CODE_INVALID,
      );
    }

    const stripeCustomerId = await this.getStripeCustomerIdOrThrow(workspaceId);

    if (!(await this.isTrialingOrWithoutSubscription(workspaceId))) {
      throw new BillingException(
        `Partner code of workspace ${workspaceId} is locked: subscription is past trial`,
        BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
      );
    }

    const { partner: existingPartnerCode, email } =
      await this.stripeCustomerService.getCustomerPartnerAndEmail(
        stripeCustomerId,
      );

    if (isDefined(existingPartnerCode)) {
      throw new BillingException(
        `Partner code of workspace ${workspaceId} is locked`,
        BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
      );
    }

    if (
      isNonEmptyString(email) &&
      (await this.stripeCustomerService.isPreviousCustomer({
        email,
        currentStripeCustomerId: stripeCustomerId,
      }))
    ) {
      throw new BillingException(
        `Partner code refused for workspace ${workspaceId}: previous customer`,
        BillingExceptionCode.BILLING_PARTNER_CODE_NOT_ELIGIBLE,
      );
    }

    await this.stripeCustomerService.updateCustomerPartner(
      stripeCustomerId,
      normalizedPartnerCode,
    );

    return { partnerCode: normalizedPartnerCode, isEditable: false };
  }

  private async isTrialingOrWithoutSubscription(workspaceId: string) {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    return (
      !isDefined(subscription) ||
      subscription.status === SubscriptionStatus.Trialing
    );
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
