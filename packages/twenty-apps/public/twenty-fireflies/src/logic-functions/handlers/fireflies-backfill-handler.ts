import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { FirefliesBackfillOutcome } from 'src/logic-functions/constants/fireflies-backfill-outcome';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import { getFirefliesBackfillDays } from 'src/logic-functions/utils/get-fireflies-backfill-days';
import {
  runFirefliesBackfill,
  type RunFirefliesBackfillResult,
  type RunFirefliesBackfillStopReason,
} from 'src/logic-functions/utils/run-fireflies-backfill';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;

const OUTCOME_BY_STOP_REASON: {
  [StopReason in RunFirefliesBackfillStopReason]: FirefliesBackfillOutcome;
} = {
  exhausted: FirefliesBackfillOutcome.COMPLETED,
  deadline: FirefliesBackfillOutcome.CONTINUATION_REQUESTED,
  'rate-limited': FirefliesBackfillOutcome.RATE_LIMITED,
  'list-failed': FirefliesBackfillOutcome.LIST_FAILED,
};

export type FirefliesBackfillHandlerArgs = {
  fromDate?: string;
  cursor?: string;
  deadlineAtMs: number;
  nowMs?: number;
};

export type FirefliesBackfillResult =
  | {
      outcome:
        | typeof FirefliesBackfillOutcome.DISABLED
        | typeof FirefliesBackfillOutcome.NOT_CONFIGURED;
      error?: string;
    }
  | ({
      outcome: Exclude<
        FirefliesBackfillOutcome,
        | typeof FirefliesBackfillOutcome.DISABLED
        | typeof FirefliesBackfillOutcome.NOT_CONFIGURED
      >;
      fromDate: string;
    } & Omit<RunFirefliesBackfillResult, 'stopReason'>);

export const firefliesBackfillHandler = async ({
  fromDate,
  cursor,
  deadlineAtMs,
  nowMs = Date.now(),
}: FirefliesBackfillHandlerArgs): Promise<FirefliesBackfillResult> => {
  const backfillDays = getFirefliesBackfillDays();

  // An explicit fromDate (manual invoke or continuation) always runs; only
  // the fresh sweep started by the post-install hook honors the kill switch.
  if (!isDefined(fromDate) && backfillDays <= 0) {
    return { outcome: FirefliesBackfillOutcome.DISABLED };
  }

  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return {
      outcome: FirefliesBackfillOutcome.NOT_CONFIGURED,
      error: apiKeyResult.error,
    };
  }

  const effectiveFromDate =
    fromDate ?? new Date(nowMs - backfillDays * MILLISECONDS_PER_DAY).toISOString();

  const { stopReason, ...runResult } = await runFirefliesBackfill({
    apiKey: apiKeyResult.apiKey,
    client: new CoreApiClient(),
    fromDate: effectiveFromDate,
    cursor,
    deadlineAtMs,
  });

  return {
    outcome: OUTCOME_BY_STOP_REASON[stopReason],
    fromDate: effectiveFromDate,
    ...runResult,
  };
};
