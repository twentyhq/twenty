import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { parsePaymentFrameEvent } from '@/settings/billing/payment-frame/utils/parsePaymentFrameEvent';

const buildMessage = (event: unknown) => ({
  source: PAYMENT_FRAME_MESSAGE_SOURCE,
  event,
});

describe('parsePaymentFrameEvent', () => {
  it('reads a confirmation token', () => {
    expect(
      parsePaymentFrameEvent(
        buildMessage({
          type: 'confirmation-token',
          confirmationTokenId: 'ctoken_123',
        }),
      ),
    ).toEqual({
      type: 'confirmation-token',
      confirmationTokenId: 'ctoken_123',
    });
  });

  it('reads a frame height', () => {
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'resize', height: 312 })),
    ).toEqual({ type: 'resize', height: 312 });
  });

  it('reads whether the browser offers a wallet', () => {
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'ready', hasWallets: true })),
    ).toEqual({ type: 'ready', hasWallets: true });
  });

  it('drops an error message that is not text', () => {
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'error', message: 42 })),
    ).toEqual({ type: 'error', message: undefined });
  });

  it('ignores messages from other senders', () => {
    expect(
      parsePaymentFrameEvent({ source: 'stripe', event: { type: 'ready' } }),
    ).toBeUndefined();
    expect(parsePaymentFrameEvent('ready')).toBeUndefined();
  });

  it('ignores malformed events', () => {
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'confirmation-token' })),
    ).toBeUndefined();
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'resize', height: '312' })),
    ).toBeUndefined();
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'ready' })),
    ).toBeUndefined();
    expect(
      parsePaymentFrameEvent(buildMessage({ type: 'unknown' })),
    ).toBeUndefined();
  });
});
