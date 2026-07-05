import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path';
import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  firefliesBackfillHandler,
  type FirefliesBackfillResult,
} from 'src/logic-functions/handlers/fireflies-backfill-handler';

const TIMEOUT_SECONDS = 900;
const CONTINUATION_RESERVE_MS = 30_000;

type FirefliesBackfillRouteBody = {
  fromDate?: unknown;
  cursor?: unknown;
};

const toIsoDateOrUndefined = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsedMs = Date.parse(value);

  return Number.isNaN(parsedMs) ? undefined : new Date(parsedMs).toISOString();
};

const firefliesBackfillRouteHandler = async (
  payload: RoutePayload<FirefliesBackfillRouteBody>,
): Promise<FirefliesBackfillResult> => {
  const startedAtMs = Date.now();

  return firefliesBackfillHandler({
    fromDate: toIsoDateOrUndefined(payload.body?.fromDate),
    cursor: toIsoDateOrUndefined(payload.body?.cursor),
    deadlineAtMs:
      startedAtMs + TIMEOUT_SECONDS * 1_000 - CONTINUATION_RESERVE_MS,
    nowMs: startedAtMs,
  });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-backfill',
  description:
    'Backfills Fireflies call history into CallRecording records: pages through the Fireflies transcripts API newest-first and replays every call through the same transcript + summary sync as the webhook. Called with no body to sweep the configured FIREFLIES_BACKFILL_DAYS window, or with { fromDate, cursor } to continue a sweep; re-invokes itself with the remaining window when a run approaches the timeout or hits the Fireflies rate limit.',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: firefliesBackfillRouteHandler,
  httpRouteTriggerSettings: {
    path: FIREFLIES_BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
