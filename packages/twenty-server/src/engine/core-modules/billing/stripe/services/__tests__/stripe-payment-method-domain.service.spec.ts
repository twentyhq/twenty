/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { StripePaymentMethodDomainService } from 'src/engine/core-modules/billing/stripe/services/stripe-payment-method-domain.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('StripePaymentMethodDomainService', () => {
  let service: StripePaymentMethodDomainService;
  let isBillingEnabled: boolean;

  const stripe = {
    paymentMethodDomains: {
      list: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    isBillingEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripePaymentMethodDomainService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: (key: string) =>
              key === 'IS_BILLING_ENABLED'
                ? isBillingEnabled
                : 'stripe-api-key',
          },
        },
        { provide: StripeSDKService, useValue: { getStripe: () => stripe } },
      ],
    }).compile();

    service = module.get(StripePaymentMethodDomainService);
  });

  it('should register a domain Stripe does not know yet', async () => {
    stripe.paymentMethodDomains.list.mockResolvedValue({ data: [] });

    await service.registerDomain('acme.twenty.com');

    expect(stripe.paymentMethodDomains.list).toHaveBeenCalledTimes(1);
    expect(stripe.paymentMethodDomains.list).toHaveBeenCalledWith(
      { domain_name: 'acme.twenty.com', limit: 1 },
      { timeout: 10_000, maxNetworkRetries: 0 },
    );
    expect(stripe.paymentMethodDomains.create).toHaveBeenCalledTimes(1);
    expect(stripe.paymentMethodDomains.create).toHaveBeenCalledWith(
      { domain_name: 'acme.twenty.com' },
      { timeout: 10_000, maxNetworkRetries: 0 },
    );
  });

  it('should leave an already registered domain untouched', async () => {
    stripe.paymentMethodDomains.list.mockResolvedValue({
      data: [{ id: 'pmd_1', domain_name: 'acme.twenty.com', enabled: false }],
    });

    await service.registerDomain('acme.twenty.com');

    expect(stripe.paymentMethodDomains.create).not.toHaveBeenCalled();
  });

  it('should skip the registration once billing is turned off', async () => {
    isBillingEnabled = false;

    await service.registerDomain('acme.twenty.com');

    expect(stripe.paymentMethodDomains.list).not.toHaveBeenCalled();
    expect(stripe.paymentMethodDomains.create).not.toHaveBeenCalled();
  });
});
