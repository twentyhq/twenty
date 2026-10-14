/* @license Enterprise */

import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

type ClampUserCreditsUsedMicroParams = {
  userCreditsUsedMicro: number;
  creditsUsedMicro: number;
};

export const clampUserCreditsUsedMicro = ({
  userCreditsUsedMicro,
  creditsUsedMicro,
}: ClampUserCreditsUsedMicroParams): number =>
  isValidCreditAmountMicro(userCreditsUsedMicro)
    ? Math.min(userCreditsUsedMicro, creditsUsedMicro)
    : 0;
