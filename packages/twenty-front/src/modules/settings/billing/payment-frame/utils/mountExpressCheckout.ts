import { PAYMENT_FRAME_ELEMENT_OUTSET_PX } from '@/settings/billing/payment-frame/constants/PaymentFrameElementOutsetPx';
import { type PaymentFrameConfiguration } from '@/settings/billing/payment-frame/types/PaymentFrameConfiguration';
import { type PaymentFrameEvent } from '@/settings/billing/payment-frame/types/PaymentFrameEvent';
import {
  type Stripe,
  type StripeElements,
  type StripeExpressCheckoutElementConfirmEvent,
} from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { isDefined } from 'twenty-shared/utils';

type PostPaymentFrameEvent = (event: PaymentFrameEvent) => void;

const confirmExpressCheckout = async ({
  stripe,
  elements,
  event,
  postEvent,
}: {
  stripe: Stripe;
  elements: StripeElements;
  event: StripeExpressCheckoutElementConfirmEvent;
  postEvent: PostPaymentFrameEvent;
}) => {
  const { error: submitError } = await elements.submit();

  if (isDefined(submitError)) {
    event.paymentFailed({ reason: 'fail' });
    postEvent({ type: 'error', message: submitError.message });

    return;
  }

  const { error, confirmationToken } = await stripe.createConfirmationToken({
    elements,
  });

  if (isDefined(error) || !isDefined(confirmationToken)) {
    event.paymentFailed({ reason: 'fail' });
    postEvent({ type: 'error', message: error?.message });

    return;
  }

  postEvent({
    type: 'confirmation-token',
    confirmationTokenId: confirmationToken.id,
  });
};

// Browsers pause resize observers in a zero-height cross-origin frame, so the
// first height is sent right away
const reportHeight = (root: HTMLElement, postEvent: PostPaymentFrameEvent) => {
  const postHeight = () =>
    postEvent({
      type: 'resize',
      height: Math.ceil(root.getBoundingClientRect().height),
    });

  postHeight();
  new ResizeObserver(postHeight).observe(root);
};

export const mountExpressCheckout = async ({
  root,
  configuration,
  postEvent,
}: {
  root: HTMLElement;
  configuration: PaymentFrameConfiguration;
  postEvent: PostPaymentFrameEvent;
}) => {
  document.documentElement.style.colorScheme = configuration.colorScheme;

  const stripe = await loadStripe(configuration.publishableKey).catch(
    () => null,
  );

  if (!isDefined(stripe)) {
    postEvent({ type: 'ready', hasWallets: false });

    return;
  }

  const elements = stripe.elements(configuration.elementsOptions);
  const buttonTheme = configuration.colorScheme === 'dark' ? 'white' : 'black';

  const expressCheckoutElement = elements.create('expressCheckout', {
    buttonHeight: 40,
    buttonTheme: { applePay: buttonTheme, googlePay: buttonTheme },
    paymentMethods: {
      amazonPay: 'never',
      applePay: 'auto',
      googlePay: 'auto',
      klarna: 'never',
      link: 'never',
      paypal: 'never',
    },
  });

  expressCheckoutElement.on('ready', ({ availablePaymentMethods }) => {
    const hasWallets = isDefined(availablePaymentMethods);

    postEvent({ type: 'ready', hasWallets });

    if (hasWallets) {
      reportHeight(root, postEvent);
    }
  });
  expressCheckoutElement.on('loaderror', () =>
    postEvent({ type: 'ready', hasWallets: false }),
  );
  expressCheckoutElement.on('confirm', (event) =>
    confirmExpressCheckout({ stripe, elements, event, postEvent }),
  );

  root.style.padding = `${PAYMENT_FRAME_ELEMENT_OUTSET_PX}px`;
  expressCheckoutElement.mount(root);
};
