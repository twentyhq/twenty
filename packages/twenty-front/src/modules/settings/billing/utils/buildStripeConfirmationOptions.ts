import { type StripeElements } from '@stripe/stripe-js';
import { isDefined } from 'twenty-shared/utils';

export const buildStripeConfirmationOptions = ({
  elements,
  walletConfirmationTokenId,
  returnUrl,
}: {
  elements: StripeElements;
  walletConfirmationTokenId?: string;
  returnUrl: string;
}) =>
  isDefined(walletConfirmationTokenId)
    ? {
        confirmParams: {
          confirmation_token: walletConfirmationTokenId,
          return_url: returnUrl,
        },
      }
    : { elements, confirmParams: { return_url: returnUrl } };
