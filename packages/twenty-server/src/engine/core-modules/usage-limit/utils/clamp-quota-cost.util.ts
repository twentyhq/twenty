import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';

export const clampQuotaCost = (cost: QuotaCost): QuotaCost => ({
  creditsUsedMicro: isValidCreditAmountMicro(cost.creditsUsedMicro)
    ? cost.creditsUsedMicro
    : 0,
  quantity: isValidCreditAmountMicro(cost.quantity) ? cost.quantity : 0,
});
