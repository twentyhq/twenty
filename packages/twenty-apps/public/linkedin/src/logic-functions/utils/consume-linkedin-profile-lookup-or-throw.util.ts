import { kv } from 'twenty-sdk/logic-function';

import { getLinkedinProfileLookupsKey } from 'src/logic-functions/utils/get-linkedin-profile-lookups-key.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

// Counts over a rolling day; concurrent jobs can undercount, which the margin under LinkedIn's limit absorbs
export const consumeLinkedinProfileLookupOrThrow = async ({
  unipileAccountId,
  dailyLimit,
}: {
  unipileAccountId: string;
  dailyLimit: number;
}): Promise<void> => {
  const key = getLinkedinProfileLookupsKey(unipileAccountId);
  const now = Date.now();
  const lookupTimestamps = ((await kv.get<number[]>(key)) ?? []).filter(
    (lookupTimestamp) => lookupTimestamp > now - DAY_MILLISECONDS,
  );

  if (lookupTimestamps.length >= dailyLimit) {
    const freedAt =
      lookupTimestamps[lookupTimestamps.length - dailyLimit] + DAY_MILLISECONDS;

    throw new UnipileRateLimitError(
      `LinkedIn account ${unipileAccountId} used its ${dailyLimit} profile lookups of the day`,
      Math.ceil((freedAt - now) / 1000),
    );
  }

  await kv.set(key, [...lookupTimestamps, now]);
};
