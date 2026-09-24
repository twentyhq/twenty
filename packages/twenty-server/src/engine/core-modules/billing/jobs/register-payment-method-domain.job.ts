/* @license Enterprise */

import { StripePaymentMethodDomainService } from 'src/engine/core-modules/billing/stripe/services/stripe-payment-method-domain.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type RegisterPaymentMethodDomainJobData = { domainName: string };

@Processor(MessageQueue.billingQueue)
export class RegisterPaymentMethodDomainJob {
  constructor(
    private readonly stripePaymentMethodDomainService: StripePaymentMethodDomainService,
  ) {}

  @Process(RegisterPaymentMethodDomainJob.name)
  async handle({ domainName }: RegisterPaymentMethodDomainJobData) {
    await this.stripePaymentMethodDomainService.registerDomain(domainName);
  }
}
