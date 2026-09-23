/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { type BillingCustomerPaymentStatus } from 'src/engine/core-modules/billing/types/billing-customer-payment-status.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

@Injectable()
@WorkspaceCache('billingCustomerPaymentStatus', { packingPonderation: 1 })
export class WorkspaceBillingCustomerPaymentStatusCacheService extends WorkspaceCacheProvider<BillingCustomerPaymentStatus> {
  constructor(
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeInvoiceService: StripeInvoiceService,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
  }: WorkspaceCacheProviderContext): Promise<BillingCustomerPaymentStatus> {
    const billingCustomer = await this.billingCustomerRepository.findOneBy(
      workspaceId,
      {},
    );

    if (!isDefined(billingCustomer)) {
      return { hasPaymentMethod: false, hasReceivedPayment: false };
    }

    const [hasPaymentMethod, hasReceivedPayment] = await Promise.all([
      billingCustomer.hasPaymentMethod ??
        this.stripeCustomerService.hasPaymentMethod(
          billingCustomer.stripeCustomerId,
        ),
      this.stripeInvoiceService.hasPaidNonZeroInvoice(
        billingCustomer.stripeCustomerId,
      ),
    ]);

    return { hasPaymentMethod, hasReceivedPayment };
  }
}
