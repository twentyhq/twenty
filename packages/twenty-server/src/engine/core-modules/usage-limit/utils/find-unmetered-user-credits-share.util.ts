import { isNonEmptyArray } from 'twenty-shared/utils';

import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';

export const findUnmeteredUserCreditsShare = (
  debits: Pick<QuotaDebit, 'amount' | 'split'>[],
): number => {
  const userCreditsAmounts = debits.flatMap(({ amount, split }) =>
    split?.kind === 'userCredits' ? [amount] : [],
  );

  return isNonEmptyArray(userCreditsAmounts)
    ? Math.min(...userCreditsAmounts)
    : 0;
};
