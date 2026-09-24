import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { type PaymentFrameCommand } from '@/settings/billing/payment-frame/types/PaymentFrameCommand';
import { type PaymentFrameConfiguration } from '@/settings/billing/payment-frame/types/PaymentFrameConfiguration';
import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const parsePaymentFrameCommand = (
  data: unknown,
): PaymentFrameCommand | undefined => {
  if (
    !isPlainObject(data) ||
    data.source !== PAYMENT_FRAME_MESSAGE_SOURCE ||
    !isPlainObject(data.command) ||
    data.command.type !== 'configure' ||
    !isPlainObject(data.command.configuration) ||
    !isNonEmptyString(data.command.configuration.publishableKey)
  ) {
    return undefined;
  }

  return {
    type: 'configure',
    configuration: data.command.configuration as PaymentFrameConfiguration,
  };
};
