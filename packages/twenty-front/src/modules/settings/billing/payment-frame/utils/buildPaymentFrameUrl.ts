import { isNonEmptyString } from '@sniptt/guards';
import { PAYMENT_FRAME_PATH } from 'twenty-shared/constants';

// Stripe only offers Apple Pay and Google Pay on registered domains, so
// workspace subdomains load the payment form from the default domain. Custom
// domains keep it on their own origin since the server only lets subdomains
// of the front domain frame it.
export const buildPaymentFrameUrl = ({
  currentUrl,
  frontDomain,
  defaultDomain,
}: {
  currentUrl: string;
  frontDomain: string;
  defaultDomain: string;
}): string => {
  const paymentFrameUrl = new URL(PAYMENT_FRAME_PATH, currentUrl);

  const isOnFrontDomain =
    isNonEmptyString(frontDomain) &&
    (paymentFrameUrl.hostname === frontDomain ||
      paymentFrameUrl.hostname.endsWith(`.${frontDomain}`));

  if (isOnFrontDomain && isNonEmptyString(defaultDomain)) {
    paymentFrameUrl.hostname = defaultDomain;
  }

  return paymentFrameUrl.toString();
};
