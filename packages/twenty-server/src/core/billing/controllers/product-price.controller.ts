import { Controller, Get, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import {
  AvailableProducts,
  BillingService,
  PriceData,
} from 'src/core/billing/billing.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';

@Controller('stripe/product-prices/*')
export class ProductPriceController {
  constructor(
    private readonly stripeService: StripeService,
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

    const subscriptionProductPrices =
      await this.stripeService.stripe.prices.search({
        query: `product: '${productId}'`,
      });

    res.send(
      this.billingService.formatProductPrices(subscriptionProductPrices.data),
    );
  }
}
