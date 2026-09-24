import { PAYMENT_FRAME_ELEMENT_OUTSET_PX } from '@/settings/billing/payment-frame/constants/PaymentFrameElementOutsetPx';
import { StripeWalletFrameEffect } from '@/settings/billing/payment-frame/effect-components/StripeWalletFrameEffect';
import { useStripeWalletFrameConfiguration } from '@/settings/billing/payment-frame/hooks/useStripeWalletFrameConfiguration';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type StripeElementsOptionsMode } from '@stripe/stripe-js';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';

const StyledWalletButtons = styled.div`
  display: flex;
  flex-direction: column;
`;

// The frame pads the buttons for Stripe's focus rings, so the iframe gives
// that space back to line up with the card form below
const StyledWalletFrame = styled.iframe`
  border: none;
  display: block;
  width: 100%;

  &[data-visible] {
    margin: -${PAYMENT_FRAME_ELEMENT_OUTSET_PX}px;
    width: calc(100% + ${2 * PAYMENT_FRAME_ELEMENT_OUTSET_PX}px);
  }
`;

type StripeWalletButtonsProps = {
  elementsOptions: StripeElementsOptionsMode;
  onConfirmationToken: (confirmationTokenId: string) => void;
};

export const StripeWalletButtons = ({
  elementsOptions,
  onConfirmationToken,
}: StripeWalletButtonsProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { frameUrl, configuration } =
    useStripeWalletFrameConfiguration(elementsOptions);

  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(
    null,
  );
  const [hasWallets, setHasWallets] = useState(false);
  const [height, setHeight] = useState(0);

  const isVisible = hasWallets && height > 0;

  return (
    <StyledWalletButtons>
      <StripeWalletFrameEffect
        iframeElement={iframeElement}
        frameUrl={frameUrl}
        configuration={configuration}
        onReady={setHasWallets}
        onResize={setHeight}
        onConfirmationToken={onConfirmationToken}
        onError={(message) =>
          enqueueToast({
            variant: 'error',
            children:
              message ??
              t`We couldn't confirm your payment method. Please retry.`,
          })
        }
      />
      <StyledWalletFrame
        ref={setIframeElement}
        src={frameUrl}
        allow="payment"
        title={t`Express checkout`}
        height={isVisible ? height : 0}
        data-visible={isVisible || undefined}
        aria-hidden={!isVisible}
        tabIndex={isVisible ? undefined : -1}
      />
      {isVisible && <HorizontalSeparator text={t`Or`} />}
    </StyledWalletButtons>
  );
};
