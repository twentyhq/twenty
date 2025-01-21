import { Post, Controller, Logger, Req, Res } from '@nestjs/common';

import Stripe from 'stripe';

import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';

const stripeSecretKey = process.env.WEBHOOK_STRIPE_SK;

if (!stripeSecretKey) {
  throw new Error('WEBHOOK_STRIPE_SECRETKEY is not defined');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-10-28.acacia',
});

@Controller('stripe')
export class SripeController {
  protected readonly logger = new Logger(SripeController.name);

  constructor(
    private readonly stripeIntegrationService: StripeIntegrationService,
  ) {}

  @Post('/account_link')
  async handleCreateAccountLink(@Req() req: any, @Res() res: any) {
    try {
      const { account } = req.body;

      const accouuntLink = await stripe.accountLinks.create({
        account: account,
        return_url: `${req.headers.origin}/settings/integrations/stripe`,
        refresh_url: `${req.headers.origin}/refresh/${account}`,
        type: 'account_onboarding',
      });

      return res.json(accouuntLink);
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account link:',
        error,
      );
      res.status(500);
      res.send({ error: error.message });
    }
  }

  @Post('/account')
  async handleAccount(@Req() req: any, @Res() res: any) {
    try {
      const { workspaceId } = req.body;

      console.log('workspaceId:', workspaceId);

      const account = await stripe.accounts.create({});

      const accountDetails = await stripe.accounts.retrieve(account.id);

      await this.stripeIntegrationService.saveAccountId(
        account.id,
        workspaceId,
      );

      return res.json({
        account: account.id,
        businessProfile: accountDetails.business_profile,
        settings: accountDetails.settings,
        email: accountDetails.email,
        metadata: accountDetails.metadata,
      });
    } catch (error) {
      this.logger.error(
        'An error occurred when calling the Stripe API to create an account',
        error,
      );
      res.status(500);
      res.send({ error: error.message });
    }
  }

  @Post('/create-checkout-session')
  async createCheckoutSession(@Req() req: any, @Res() res: any) {
    try {
      const { amount, currency } = req.body;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'kvoip',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/settings/integrations/stripe?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/settings/integrations/stripe`,
      });

      return res.json({ id: session.id });
    } catch (error) {
      this.logger.error(
        'An error occurred when calling the Stripe API to create a checkout session',
        error,
      );
      res.status(500);
      res.send({ error: error.message });
    }
  }
}
