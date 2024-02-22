import { Controller, Get, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import {
  AvailableProduct,
  BillingService,
  PriceData,
} from 'src/core/billing/billing.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';

@Controller('billing/products/*/prices')
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
    const product = request.path
      .replace('billing/products/', '')
      .replace('/prices', '') as AvailableProduct;

    const stripeProductId = this.billingService.getProductStripeId(product);

    if (!stripeProductId) {
      res.status(404).send({
        error: `Product '${product}' not found, available products are ['${Object.values(
          AvailableProduct,
        ).join("','")}']`,
      });
    }

    const subscriptionProductPrices =
      await this.stripeService.stripe.prices.search({
        query: `product: '${stripeProductId}'`,
      });

    res.send(
      this.billingService.formatProductPrices(subscriptionProductPrices.data),
    );
  }
}
