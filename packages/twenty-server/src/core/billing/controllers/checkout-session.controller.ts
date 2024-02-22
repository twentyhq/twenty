import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { StripeService } from 'src/core/billing/stripe/stripe.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthUser } from 'src/decorators/auth/auth-user.decorator';
import { User } from 'src/core/user/user.entity';
import {
  AvailableProduct,
  BillingService,
} from 'src/core/billing/billing.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

enum RecurringInterval {
  MONTH = 'month',
  YEAR = 'year',
}

@UseGuards(JwtAuthGuard)
@Controller('billing/checkout')
export class CheckoutSessionController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly billingService: BillingService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Post()
  async post(
    @AuthUser() user: User,
    @Body() body: { recurringInterval: RecurringInterval },
    @Res() res: Response,
  ) {
    const productId = this.billingService.getProductStripeId(
      AvailableProduct.BasePlan,
    );

    if (!productId) {
      res
        .status(404)
        .send(
          'BasePlan productId not found, please check your BILLING_STRIPE_BASE_PLAN_PRODUCT_ID env variable',
        );

      return;
    }

    const productPrices = await this.billingService.getProductPrices(productId);
    const recurringInterval = body.recurringInterval;
    const priceId = productPrices[recurringInterval]?.id;

    if (!priceId) {
      res.status(404).send(
        `BasePlan priceId not found, please check a price for ${recurringInterval} recurring interval 
          is set for product ${productId}`,
      );

      return;
    }
    const frontBaseUrl = this.environmentService.getFrontBaseUrl();
    const session = await this.stripeService.stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1, // number of users in current workspace of logged in user
        },
      ],
      mode: 'subscription',
      customer_email: user.email,
      success_url: frontBaseUrl,
      cancel_url: frontBaseUrl,
    });

    if (!session.url) {
      return;
    }

    res.redirect(303, session.url);
  }
}
