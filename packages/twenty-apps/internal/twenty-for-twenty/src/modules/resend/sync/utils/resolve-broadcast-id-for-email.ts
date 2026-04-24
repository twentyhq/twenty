import type { SentBroadcast } from '@modules/resend/sync/utils/find-recent-sent-broadcasts';

export const BROADCAST_EMAIL_MATCH_WINDOW_MS = 60 * 60 * 1000;

const findLargestIndexAtOrBefore = (
  sortedBroadcasts: ReadonlyArray<SentBroadcast>,
  emailCreatedAtMs: number,
): number => {
  let low = 0;
  let high = sortedBroadcasts.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = (low + high) >>> 1;

    if (sortedBroadcasts[mid].sentAtMs <= emailCreatedAtMs) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
};

export const resolveBroadcastIdForEmail = (
  emailCreatedAtMs: number,
  sortedBroadcasts: ReadonlyArray<SentBroadcast>,
): string | undefined => {
  if (sortedBroadcasts.length === 0) return undefined;
  if (Number.isNaN(emailCreatedAtMs)) return undefined;

  const candidateIndex = findLargestIndexAtOrBefore(
    sortedBroadcasts,
    emailCreatedAtMs,
  );

  if (candidateIndex === -1) return undefined;

  const candidate = sortedBroadcasts[candidateIndex];
  const delta = emailCreatedAtMs - candidate.sentAtMs;

  if (delta > BROADCAST_EMAIL_MATCH_WINDOW_MS) return undefined;

  return candidate.id;
};
