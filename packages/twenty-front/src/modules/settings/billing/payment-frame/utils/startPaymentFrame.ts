import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { type PaymentFrameEvent } from '@/settings/billing/payment-frame/types/PaymentFrameEvent';
import { mountExpressCheckout } from '@/settings/billing/payment-frame/utils/mountExpressCheckout';
import { parsePaymentFrameCommand } from '@/settings/billing/payment-frame/utils/parsePaymentFrameCommand';
import { isDefined } from 'twenty-shared/utils';

// Runs inside the iframe served from the default domain, the only domain
// registered with Stripe, to show Apple Pay and Google Pay on every workspace.
// The workspace page confirms the resulting token itself, so 3D Secure and
// redirects stay in the top window.
export const startPaymentFrame = (root: HTMLElement) => {
  let parentOrigin: string | undefined;

  const postEvent = (event: PaymentFrameEvent) => {
    window.parent.postMessage(
      { source: PAYMENT_FRAME_MESSAGE_SOURCE, event },
      parentOrigin ?? '*',
    );
  };

  const handleMessage = (messageEvent: MessageEvent) => {
    if (messageEvent.source !== window.parent) {
      return;
    }

    const command = parsePaymentFrameCommand(messageEvent.data);

    if (!isDefined(command)) {
      return;
    }

    window.removeEventListener('message', handleMessage);
    parentOrigin = messageEvent.origin;
    void mountExpressCheckout({
      root,
      configuration: command.configuration,
      postEvent,
    });
  };

  window.addEventListener('message', handleMessage);
  postEvent({ type: 'loaded' });
};
