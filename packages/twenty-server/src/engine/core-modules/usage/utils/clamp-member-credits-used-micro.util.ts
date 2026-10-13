/* @license Enterprise */

import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

type ClampMemberCreditsUsedMicroParams = {
  memberCreditsUsedMicro: number;
  creditsUsedMicro: number;
};

export const clampMemberCreditsUsedMicro = ({
  memberCreditsUsedMicro,
  creditsUsedMicro,
}: ClampMemberCreditsUsedMicroParams): number =>
  isValidCreditAmountMicro(memberCreditsUsedMicro)
    ? Math.min(memberCreditsUsedMicro, creditsUsedMicro)
    : 0;
