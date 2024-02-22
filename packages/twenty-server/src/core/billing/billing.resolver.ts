import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { StripeService } from 'src/core/billing/stripe/stripe.service';

@UseGuards(JwtAuthGuard)
@Resolver()
export class BillingResolver {
  constructor(private readonly stripeService: StripeService) {}

  @Mutation(() => String)
  async checkout() {
    await this.stripeService.stripe.checkout.sessions.create({
      line_items: [
        {
          price: '', // STRIPE_DEFAULT_PRICE_ID,
          quantity: 1, // number of users in current workspace of logged in user
        },
      ],
      mode: 'subscription',
      customer_email: '', // logged in user’s email
      success_url: '', // see tasks below, needs to be create
      cancel_url: '', // see tasks below, needs to be create
    });

    //res.redirect(303, session.url);
  }
}
