import { Controller, Logger, Post, Req, Res } from '@nestjs/common';

import Stripe from 'stripe';

import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Controller('stripe')
export class SripeController {
  protected readonly logger = new Logger(SripeController.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly stripeIntegrationService: StripeIntegrationService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.stripe = new Stripe(
      this.twentyConfigService.get('WEBHOOK_STRIPE_SECRETKEY'),
      {
        apiVersion: '2024-10-28.acacia',
      },
    );
  }

  @Post('/account_link')
  async handleCreateAccountLink(@Req() req: any, @Res() res: any) {
    try {
      const { account } = req.body;

      const accouuntLink = await this.stripe.accountLinks.create({
        account: account,
        return_url: `${req.headers.origin}/settings/integrations/stripe`,
        refresh_url: `${req.headers.origin}/refresh/${account}`,
        type: 'account_onboarding',
      });

      return res.json(accouuntLink);
    } catch (error) {
      this.logger.error(
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

      const account = await this.stripe.accounts.create({});

      const accountDetails = await this.stripe.accounts.retrieve(account.id);

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

      const session = await this.stripe.checkout.sessions.create({
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
        success_url: req.body.success_url,
        cancel_url: req.body.cancel_url,
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
