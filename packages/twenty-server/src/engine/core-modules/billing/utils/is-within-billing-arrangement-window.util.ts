/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

export const isWithinBillingArrangementWindow = ({
  startsAtMs,
  endsAtMs,
  nowMs,
}: {
  startsAtMs: number;
  endsAtMs: number | null;
  nowMs: number;
}): boolean =>
  startsAtMs <= nowMs && (!isDefined(endsAtMs) || endsAtMs > nowMs);
