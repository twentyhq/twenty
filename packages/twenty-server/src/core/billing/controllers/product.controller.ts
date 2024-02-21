import { Controller, Get, Req } from '@nestjs/common';

import { Request } from 'express';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';

@Controller('stripe/products')
export class ProductController {
  constructor(
    @InjectStripeClient()
    private readonly stripeClient: Stripe,
  ) {}

  @Get()
  async handleProductGet(@Req() request: Request) {
    await this.stripeClient.products.search('');
  }
}
