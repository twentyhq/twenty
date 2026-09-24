import { startPaymentFrame } from '@/settings/billing/payment-frame/utils/startPaymentFrame';
import { isDefined } from 'twenty-shared/utils';

const root = document.getElementById('payment-frame');

if (isDefined(root)) {
  startPaymentFrame(root);
}
