/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

class StripeCardError extends Error {}

describe('StripeSubscriptionService', () => {
  let service: StripeSubscriptionService;

  const stripe = {
    errors: { StripeCardError },
    invoices: {
      list: jest.fn(),
      pay: jest.fn(),
      retrieve: jest.fn(),
    },
  };

  const givenOpenInvoices = (invoiceIds: string[]) =>
    stripe.invoices.list.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        for (const invoiceId of invoiceIds) {
          yield { id: invoiceId, status: 'open' };
        }
      },
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    stripe.invoices.pay.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeSubscriptionService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: (key: string) =>
              key === 'IS_BILLING_ENABLED' ? true : 'stripe-api-key',
          },
        },
        { provide: StripeSDKService, useValue: { getStripe: () => stripe } },
      ],
    }).compile();

    service = module.get(StripeSubscriptionService);
  });

  describe('payOpenInvoices', () => {
    it('should pay every open auto-charged invoice, oldest first, with the new payment method', async () => {
      givenOpenInvoices(['in_newer', 'in_older']);

      await service.payOpenInvoices({
        stripeSubscriptionId: 'sub_1',
        stripePaymentMethodId: 'pm_1',
      });

      expect(stripe.invoices.list).toHaveBeenCalledWith({
        subscription: 'sub_1',
        status: 'open',
        collection_method: 'charge_automatically',
        limit: 100,
      });
      expect(stripe.invoices.pay.mock.calls).toEqual([
        ['in_older', { payment_method: 'pm_1' }],
        ['in_newer', { payment_method: 'pm_1' }],
      ]);
    });

    it('should keep paying the remaining invoices when the card is declined', async () => {
      givenOpenInvoices(['in_newer', 'in_older']);
      stripe.invoices.pay.mockRejectedValueOnce(
        new StripeCardError('Your card was declined.'),
      );

      await expect(
        service.payOpenInvoices({
          stripeSubscriptionId: 'sub_1',
          stripePaymentMethodId: 'pm_1',
        }),
      ).resolves.toBeUndefined();

      expect(stripe.invoices.pay).toHaveBeenCalledTimes(2);
    });

    it('should move on when the invoice was settled in the meantime', async () => {
      givenOpenInvoices(['in_newer', 'in_older']);
      stripe.invoices.pay.mockRejectedValueOnce(
        new Error('This invoice is already paid.'),
      );
      stripe.invoices.retrieve.mockResolvedValue({
        id: 'in_older',
        status: 'paid',
      });

      await expect(
        service.payOpenInvoices({
          stripeSubscriptionId: 'sub_1',
          stripePaymentMethodId: 'pm_1',
        }),
      ).resolves.toBeUndefined();

      expect(stripe.invoices.retrieve).toHaveBeenCalledWith('in_older');
      expect(stripe.invoices.pay).toHaveBeenCalledTimes(2);
    });

    it('should propagate a failure that leaves the invoice open', async () => {
      givenOpenInvoices(['in_1']);
      const stripeError = new Error('Stripe is unavailable');

      stripe.invoices.pay.mockRejectedValueOnce(stripeError);
      stripe.invoices.retrieve.mockResolvedValue({
        id: 'in_1',
        status: 'open',
      });

      await expect(
        service.payOpenInvoices({
          stripeSubscriptionId: 'sub_1',
          stripePaymentMethodId: 'pm_1',
        }),
      ).rejects.toBe(stripeError);
    });
  });
});
