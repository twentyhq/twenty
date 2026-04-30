import { Controller, Post, Get, Body, Param, Headers, Logger, HttpCode, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FintechService } from './fintech.service';
import { EmbeddedPaymentEntity } from './fintech.entity';

@Controller('rest/fintech')
export class FintechController {
  private readonly logger = new Logger(FintechController.name);

  constructor(
    private readonly service: FintechService,
    @InjectRepository(EmbeddedPaymentEntity)
    private readonly paymentRepo: Repository<EmbeddedPaymentEntity>,
  ) {}

  @Post('webhook/stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      type: string;
      data: { object: { id: string; metadata?: { paymentId?: string }; status?: string } };
    },
  ) {
    this.logger.log(`Stripe webhook: ${payload.type} (workspace: ${workspaceId})`);

    if (payload.type === 'checkout.session.completed' || payload.type === 'payment_intent.succeeded') {
      const paymentId = payload.data.object.metadata?.paymentId;

      if (paymentId) {
        const payment = await this.service.markPaymentCompleted(paymentId, payload.data.object.id);

        return { success: true, paymentId: payment.id };
      }
    }

    return { success: true, handled: false };
  }

  @Post('webhook/payu')
  @HttpCode(200)
  async handlePayUWebhook(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      reference_sale: string;
      state_pol: string;
      transaction_id: string;
    },
  ) {
    this.logger.log(`PayU webhook: ${payload.state_pol} for ref ${payload.reference_sale} (workspace: ${workspaceId})`);

    if (payload.state_pol === '4') {
      const payment = await this.service.markPaymentCompleted(
        payload.reference_sale,
        payload.transaction_id,
      );

      return { success: true, paymentId: payment.id };
    }

    return { success: true, handled: false };
  }

  @Get('payment-link/:id')
  async redirectToPayment(@Param('id') paymentId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });

    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

    return { redirectUrl: payment.paymentLink, amount: payment.amount, currency: payment.currency, gateway: payment.gateway };
  }
}
