import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { parsePaymentFrameCommand } from '@/settings/billing/payment-frame/utils/parsePaymentFrameCommand';

const buildMessage = (command: unknown) => ({
  source: PAYMENT_FRAME_MESSAGE_SOURCE,
  command,
});

describe('parsePaymentFrameCommand', () => {
  it('reads a configuration with a publishable key', () => {
    const configuration = {
      publishableKey: 'pk_test_123',
      elementsOptions: { mode: 'setup', currency: 'usd' },
      colorScheme: 'light',
    };

    expect(
      parsePaymentFrameCommand(
        buildMessage({ type: 'configure', configuration }),
      ),
    ).toEqual({ type: 'configure', configuration });
  });

  it('ignores a configuration without a publishable key', () => {
    expect(
      parsePaymentFrameCommand(
        buildMessage({ type: 'configure', configuration: {} }),
      ),
    ).toBeUndefined();
  });

  it('ignores messages from other senders', () => {
    expect(
      parsePaymentFrameCommand({
        source: 'stripe',
        command: { type: 'configure', configuration: { publishableKey: 'pk' } },
      }),
    ).toBeUndefined();
  });
});
