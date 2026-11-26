import { kv } from 'twenty-sdk/logic-function';

import { getLinkedinProfileLookupsKey } from 'src/logic-functions/utils/get-linkedin-profile-lookups-key.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

const pendingConsumptionByKey = new Map<string, Promise<void>>();

const countLookupOrThrow = async ({
  key,
  unipileAccountId,
  dailyLimit,
}: {
  key: string;
  unipileAccountId: string;
  dailyLimit: number;
}): Promise<void> => {
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

// One at a time per account: the members of a group are looked up together and would all read the same count
export const consumeLinkedinProfileLookupOrThrow = ({
  unipileAccountId,
  dailyLimit,
}: {
  unipileAccountId: string;
  dailyLimit: number;
}): Promise<void> => {
  const key = getLinkedinProfileLookupsKey(unipileAccountId);
  const consumption = (pendingConsumptionByKey.get(key) ?? Promise.resolve())
    .catch(() => undefined)
    .then(() => countLookupOrThrow({ key, unipileAccountId, dailyLimit }));

  pendingConsumptionByKey.set(key, consumption);

  return consumption;
};
