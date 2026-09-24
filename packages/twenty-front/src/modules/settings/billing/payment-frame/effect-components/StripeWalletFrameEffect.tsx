import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { type PaymentFrameCommand } from '@/settings/billing/payment-frame/types/PaymentFrameCommand';
import { type PaymentFrameConfiguration } from '@/settings/billing/payment-frame/types/PaymentFrameConfiguration';
import { parsePaymentFrameEvent } from '@/settings/billing/payment-frame/utils/parsePaymentFrameEvent';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type StripeWalletFrameEffectProps = {
  iframeElement: HTMLIFrameElement | null;
  frameUrl: string;
  configuration: PaymentFrameConfiguration | undefined;
  onReady: (hasWallets: boolean) => void;
  onResize: (height: number) => void;
  onConfirmationToken: (confirmationTokenId: string) => void;
  onError: (message?: string) => void;
};

export const StripeWalletFrameEffect = ({
  iframeElement,
  frameUrl,
  configuration,
  onReady,
  onResize,
  onConfirmationToken,
  onError,
}: StripeWalletFrameEffectProps) => {
  useEffect(() => {
    if (!isDefined(iframeElement)) {
      return;
    }

    const frameOrigin = new URL(frameUrl).origin;

    const configureFrame = () => {
      if (!isDefined(configuration)) {
        return;
      }

      const command: PaymentFrameCommand = { type: 'configure', configuration };

      iframeElement.contentWindow?.postMessage(
        { source: PAYMENT_FRAME_MESSAGE_SOURCE, command },
        frameOrigin,
      );
    };

    const handleMessage = (messageEvent: MessageEvent) => {
      if (
        messageEvent.source !== iframeElement.contentWindow ||
        messageEvent.origin !== frameOrigin
      ) {
        return;
      }

      const event = parsePaymentFrameEvent(messageEvent.data);

      switch (event?.type) {
        case 'loaded':
          configureFrame();
          return;
        case 'ready':
          onReady(event.hasWallets);
          return;
        case 'resize':
          onResize(event.height);
          return;
        case 'confirmation-token':
          onConfirmationToken(event.confirmationTokenId);
          return;
        case 'error':
          onError(event.message);
          return;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  });

  return null;
};
