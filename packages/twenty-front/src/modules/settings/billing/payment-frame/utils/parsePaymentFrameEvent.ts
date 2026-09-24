import { PAYMENT_FRAME_MESSAGE_SOURCE } from '@/settings/billing/payment-frame/constants/PaymentFrameMessageSource';
import { type PaymentFrameEvent } from '@/settings/billing/payment-frame/types/PaymentFrameEvent';
import {
  isBoolean,
  isNonEmptyString,
  isNumber,
  isString,
} from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const parsePaymentFrameEvent = (
  data: unknown,
): PaymentFrameEvent | undefined => {
  if (
    !isPlainObject(data) ||
    data.source !== PAYMENT_FRAME_MESSAGE_SOURCE ||
    !isPlainObject(data.event)
  ) {
    return undefined;
  }

  const { event } = data;

  switch (event.type) {
    case 'loaded':
      return { type: 'loaded' };
    case 'ready':
      return isBoolean(event.hasWallets)
        ? { type: 'ready', hasWallets: event.hasWallets }
        : undefined;
    case 'resize':
      return isNumber(event.height)
        ? { type: 'resize', height: event.height }
        : undefined;
    case 'confirmation-token':
      return isNonEmptyString(event.confirmationTokenId)
        ? {
            type: 'confirmation-token',
            confirmationTokenId: event.confirmationTokenId,
          }
        : undefined;
    case 'error':
      return {
        type: 'error',
        message: isString(event.message) ? event.message : undefined,
      };
    default:
      return undefined;
  }
};
