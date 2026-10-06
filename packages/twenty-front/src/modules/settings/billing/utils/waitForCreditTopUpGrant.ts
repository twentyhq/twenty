import { isDefined } from 'twenty-shared/utils';

export const waitForCreditTopUpGrant = async ({
  fetchTotalGrantedCredits,
  initialTotalGrantedCredits,
  waitBeforeAttempt,
  maxAttempts,
}: {
  fetchTotalGrantedCredits: () => Promise<number | undefined>;
  initialTotalGrantedCredits: number;
  waitBeforeAttempt: () => Promise<unknown>;
  maxAttempts: number;
}): Promise<boolean> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await waitBeforeAttempt();

    let totalGrantedCredits: number | undefined;

    try {
      totalGrantedCredits = await fetchTotalGrantedCredits();
    } catch {
      continue;
    }

    if (
      isDefined(totalGrantedCredits) &&
      totalGrantedCredits > initialTotalGrantedCredits
    ) {
      return true;
    }
  }

  return false;
};
