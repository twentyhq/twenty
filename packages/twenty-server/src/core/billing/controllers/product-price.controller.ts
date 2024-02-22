import { Controller, Get, Req, Res } from '@nestjs/common';

import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { Request, Response } from 'express';

import {
  AvailableProducts,
  BillingService,
  PriceData,
} from 'src/core/billing/billing.service';

@Controller('stripe/product-prices/*')
export class ProductPriceController {
  constructor(
    @InjectStripeClient()
    private readonly stripeClient: Stripe,
    private readonly billingService: BillingService,
  ) {}

  @Get()
  async get(
    @Req() request: Request,
    @Res() res: Response<PriceData | { error: string }>,
  ) {
    const product = request.path.replace(
      '/stripe/product-prices/',
      '',
    ) as AvailableProducts;

    const productId = this.billingService.getProductStripeId(product);

    if (!productId) {
      res.status(404).send({
        error: `Product '${product}' not found, available products are ['${Object.values(
          AvailableProducts,
        ).join("','")}']`,
      });
    }

    const subscriptionProductPrices = await this.stripeClient.prices.search({
      query: `product: '${productId}'`,
    });

    res.send(
      this.billingService.formatProductPrices(subscriptionProductPrices.data),
    );
  }
}
