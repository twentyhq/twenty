import { billingState } from '@/client-config/states/billingState';
import { StripeWalletButtons } from '@/settings/billing/payment-frame/components/StripeWalletButtons';
import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { type PaymentFrameEvent } from '@/settings/billing/payment-frame/types/PaymentFrameEvent';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ToastProvider } from 'twenty-ui/components';
import { type Billing } from '~/generated-metadata/graphql';

const FRAME_ORIGIN = 'http://localhost';

const renderWalletButtons = () => {
  const store = createStore();
  const onConfirmationToken = jest.fn();

  store.set(billingState.atom, {
    stripePublishableKey: 'pk_test_123',
  } as Billing);

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <ToastProvider>
          <StripeWalletButtons
            elementsOptions={{ mode: 'setup', currency: 'usd' }}
            onConfirmationToken={onConfirmationToken}
          />
        </ToastProvider>
      </I18nProvider>
    </Provider>,
  );

  const frame = screen.getByTitle('Express checkout') as HTMLIFrameElement;

  const postFromFrame = (
    event: PaymentFrameEvent,
    { source = frame.contentWindow, origin = FRAME_ORIGIN } = {},
  ) =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { source: PAYMENT_FRAME_MESSAGE_SOURCE, event },
          origin,
          source,
        }),
      );
    });

  return { frame, onConfirmationToken, postFromFrame };
};

describe('StripeWalletButtons', () => {
  it('sends the configuration once the frame has loaded', () => {
    const { frame, postFromFrame } = renderWalletButtons();
    const postMessage = jest.spyOn(
      frame.contentWindow as Window,
      'postMessage',
    );

    postFromFrame({ type: 'loaded' });

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      {
        source: PAYMENT_FRAME_MESSAGE_SOURCE,
        command: {
          type: 'configure',
          configuration: expect.objectContaining({
            publishableKey: 'pk_test_123',
            colorScheme: 'light',
          }),
        },
      },
      FRAME_ORIGIN,
    );
  });

  it('stays hidden when the browser offers no wallet', () => {
    const { frame, postFromFrame } = renderWalletButtons();

    postFromFrame({ type: 'ready', hasWallets: false });

    expect(frame).toHaveAttribute('height', '0');
    expect(screen.queryByText('Or')).not.toBeInTheDocument();
  });

  it('shows the wallet buttons above the card form once a wallet is offered', () => {
    const { frame, postFromFrame } = renderWalletButtons();

    postFromFrame({ type: 'ready', hasWallets: true });
    postFromFrame({ type: 'resize', height: 48 });

    expect(frame).toHaveAttribute('height', '48');
    expect(screen.getByText('Or')).toBeInTheDocument();
  });

  it('hands over the confirmation token of a wallet payment', () => {
    const { onConfirmationToken, postFromFrame } = renderWalletButtons();

    postFromFrame({
      type: 'confirmation-token',
      confirmationTokenId: 'ctoken_123',
    });

    expect(onConfirmationToken).toHaveBeenCalledTimes(1);
    expect(onConfirmationToken).toHaveBeenCalledWith('ctoken_123');
  });

  it('ignores messages that do not come from the frame', () => {
    const { onConfirmationToken, postFromFrame } = renderWalletButtons();
    const event: PaymentFrameEvent = {
      type: 'confirmation-token',
      confirmationTokenId: 'ctoken_123',
    };

    postFromFrame(event, { source: window });
    postFromFrame(event, { origin: 'https://attacker.example' });

    expect(onConfirmationToken).not.toHaveBeenCalled();
  });
});
