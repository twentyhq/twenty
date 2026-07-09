/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('StripeInvoiceService', () => {
  let service: StripeInvoiceService;

  const stripeMock = {
    invoiceItems: {
      create: jest.fn(),
    },
    invoices: {
      create: jest.fn(),
      finalizeInvoice: jest.fn(),
      pay: jest.fn(),
      retrieve: jest.fn(),
    },
  };

  const upgradeInvoiceInput = {
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    diffAmountInCents: 2000,
    currency: 'usd',
    description:
      'Resource usage - Upgrade resource credit price from $0 to $20',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeInvoiceService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'IS_BILLING_ENABLED') {
                return true;
              }

              return 'stripe-api-key';
            }),
          },
        },
        {
          provide: StripeSDKService,
          useValue: {
            getStripe: jest.fn().mockReturnValue(stripeMock),
          },
        },
      ],
    }).compile();

    service = module.get(StripeInvoiceService);

    stripeMock.invoiceItems.create.mockResolvedValue({ id: 'ii_1' });
    stripeMock.invoices.create.mockResolvedValue({
      id: 'in_1',
      status: 'draft',
    });
  });

  describe('createImmediateUpgradeInvoice', () => {
    it('should pay the invoice when it is still open after finalization', async () => {
      stripeMock.invoices.finalizeInvoice.mockResolvedValue({
        id: 'in_1',
        status: 'open',
      });
      stripeMock.invoices.pay.mockResolvedValue({ id: 'in_1', status: 'paid' });

      await service.createImmediateUpgradeInvoice(upgradeInvoiceInput);

      expect(stripeMock.invoiceItems.create).toHaveBeenCalledWith({
        customer: 'cus_1',
        subscription: 'sub_1',
        amount: 2000,
        currency: 'usd',
        description: upgradeInvoiceInput.description,
      });
      expect(stripeMock.invoices.finalizeInvoice).toHaveBeenCalledWith('in_1', {
        auto_advance: true,
      });
      expect(stripeMock.invoices.pay).toHaveBeenCalledWith('in_1');
    });

    it('should not attempt payment when the invoice is settled at finalization', async () => {
      stripeMock.invoices.finalizeInvoice.mockResolvedValue({
        id: 'in_1',
        status: 'paid',
      });

      await expect(
        service.createImmediateUpgradeInvoice(upgradeInvoiceInput),
      ).resolves.toBeUndefined();

      expect(stripeMock.invoices.pay).not.toHaveBeenCalled();
    });

    it('should swallow the payment error when the invoice was paid in the meantime', async () => {
      stripeMock.invoices.finalizeInvoice.mockResolvedValue({
        id: 'in_1',
        status: 'open',
      });
      stripeMock.invoices.pay.mockRejectedValue(
        new Error('Invoice is already paid'),
      );
      stripeMock.invoices.retrieve.mockResolvedValue({
        id: 'in_1',
        status: 'paid',
      });

      await expect(
        service.createImmediateUpgradeInvoice(upgradeInvoiceInput),
      ).resolves.toBeUndefined();
    });

    it('should rethrow the payment error when the invoice is not paid', async () => {
      const paymentError = new Error('Your card was declined.');

      stripeMock.invoices.finalizeInvoice.mockResolvedValue({
        id: 'in_1',
        status: 'open',
      });
      stripeMock.invoices.pay.mockRejectedValue(paymentError);
      stripeMock.invoices.retrieve.mockResolvedValue({
        id: 'in_1',
        status: 'open',
      });

      await expect(
        service.createImmediateUpgradeInvoice(upgradeInvoiceInput),
      ).rejects.toBe(paymentError);
    });
  });
});
