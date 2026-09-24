import { type PaymentFrameConfiguration } from '@/settings/billing/payment-frame/types/PaymentFrameConfiguration';

export type PaymentFrameCommand = {
  type: 'configure';
  configuration: PaymentFrameConfiguration;
};
