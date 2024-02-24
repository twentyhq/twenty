import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import {
  AvailableProduct,
  BillingService,
  PriceData,
  RecurringInterval,
} from 'src/core/billing/billing.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { AuthUser } from 'src/decorators/auth/auth-user.decorator';
import { User } from 'src/core/user/user.entity';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly billingService: BillingService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get('/product-prices/:product')
  async get(
    @Param() params: { product: AvailableProduct },
    @Res() res: Response<PriceData | { error: string }>,
  ) {
    const stripeProductId = this.billingService.getProductStripeId(
      params.product,
    );

    if (!stripeProductId) {
      res.status(404).send({
        error: `Product '${
          params.product
        }' not found, available products are ['${Object.values(
          AvailableProduct,
        ).join("','")}']`,
      });

      return;
    }

    res.json(await this.billingService.getProductPrices(stripeProductId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/checkout')
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
      res
        .status(404)
        .send(
          `BasePlan priceId not found, please check body.recurringInterval and product '${AvailableProduct.BasePlan}' prices`,
        );

      return;
    }
    const frontBaseUrl = this.environmentService.getFrontBaseUrl();
    const session = await this.stripeService.stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: {
        workspaceId: user.defaultWorkspace.id,
      },
      customer_email: user.email,
      success_url: frontBaseUrl,
      cancel_url: frontBaseUrl,
    });

    if (!session.url) {
      res.status(400).send('Error: missing checkout.session.url');

      return;
    }

    res.redirect(303, session.url);
  }
}
