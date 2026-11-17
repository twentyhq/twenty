/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

const RECENT_RENEWAL_WINDOW_IN_MS = 24 * 60 * 60 * 1000;

export const getRecentRenewalDate = ({
  renewalDateMs,
  nowMs,
}: {
  renewalDateMs?: number;
  nowMs: number;
}): Date | undefined => {
  if (
    !isDefined(renewalDateMs) ||
    nowMs - renewalDateMs > RECENT_RENEWAL_WINDOW_IN_MS
  ) {
    return undefined;
  }

  return new Date(renewalDateMs);
};
