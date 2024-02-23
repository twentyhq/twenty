import { Controller, Get, Param, Res } from '@nestjs/common';

import { Response } from 'express';

import {
  AvailableProduct,
  BillingService,
  PriceData,
} from 'src/core/billing/billing.service';

@Controller('billing/product-prices')
export class ProductPriceController {
  constructor(private readonly billingService: BillingService) {}

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

    res.json(await this.billingService.getProductPrices(stripeProductId));
  }
}
