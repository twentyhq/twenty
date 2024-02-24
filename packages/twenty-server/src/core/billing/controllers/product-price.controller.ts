import { Controller, Get, Param, Res } from '@nestjs/common';

import { Response } from 'express';

import {
  AvailableProduct,
  BillingService,
  PriceData,
} from 'src/core/billing/billing.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';

@Controller('billing/product-prices')
export class ProductPriceController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly billingService: BillingService,
  ) {}

  @Get(':product')
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

    const productPrices = await this.stripeService.stripe.prices.search({
      query: `product: '${stripeProductId}'`,
    });

    res.json(this.billingService.formatProductPrices(productPrices.data));
  }
}
