import { buildStripeConfirmationOptions } from '@/settings/billing/utils/buildStripeConfirmationOptions';
import { type StripeElements } from '@stripe/stripe-js';

const elements = {} as StripeElements;
const returnUrl = 'https://acme.twenty.com/plan-required/success';

describe('buildStripeConfirmationOptions', () => {
  it('confirms with the card form when no wallet token is given', () => {
    expect(buildStripeConfirmationOptions({ elements, returnUrl })).toEqual({
      elements,
      confirmParams: { return_url: returnUrl },
    });
  });

  it('confirms with the wallet token instead of the card form', () => {
    expect(
      buildStripeConfirmationOptions({
        elements,
        walletConfirmationTokenId: 'ctoken_123',
        returnUrl,
      }),
    ).toEqual({
      confirmParams: {
        confirmation_token: 'ctoken_123',
        return_url: returnUrl,
      },
    });
  });
});
