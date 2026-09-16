import { isUndefined } from '@sniptt/guards';
import { getCreditAvailability } from 'twenty-sdk/billing';

type CreditAvailability = Awaited<ReturnType<typeof getCreditAvailability>>;

// A sweep schedules bots for a whole batch of meetings and the verdict is the
// same for every one of them, so a short memo keeps the batch to one billing
// round trip while staying well under the delay a top-up can tolerate.
const CREDIT_AVAILABILITY_MEMO_TTL_MS = 30_000;

let memoizedCreditAvailability:
  | { expiresAt: number; creditAvailability: CreditAvailability }
  | undefined;

export const getWorkspaceCreditAvailability =
  async (): Promise<CreditAvailability> => {
    const now = Date.now();

    if (
      !isUndefined(memoizedCreditAvailability) &&
      now < memoizedCreditAvailability.expiresAt
    ) {
      return memoizedCreditAvailability.creditAvailability;
    }

    const creditAvailability = await getCreditAvailability();

    memoizedCreditAvailability = {
      expiresAt: now + CREDIT_AVAILABILITY_MEMO_TTL_MS,
      creditAvailability,
    };

    return creditAvailability;
  };

export const resetWorkspaceCreditAvailabilityMemo = (): void => {
  memoizedCreditAvailability = undefined;
};
