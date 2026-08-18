import { defineLogicFunction } from 'twenty-sdk/define';
import axios from "axios";
import { fetchCurrentWorkspace } from "src/logic-functions/requests/fetch-current-workspace.util";
import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { startTimeBudget } from "src/logic-functions/utils/time-budget.util";
import { TIMEOUT_SECONDS } from "src/constants/timeout-seconds";
import { stage1 } from "src/logic-functions/stages/stage1";
import { stage2 } from "src/logic-functions/stages/stage2";
import { stage3 } from "src/logic-functions/stages/stage3";
import { stage4 } from "src/logic-functions/stages/stage4";
import { stage5 } from "src/logic-functions/stages/stage5";
import { stage6 } from "src/logic-functions/stages/stage6";
import { stage7 } from "src/logic-functions/stages/stage7";
import { TRIGGER_ROUTE_PATH } from "src/constants/trigger-route-path";

// Logic:
// Read all apps
// Filter out all OAuth installed apps (to exclude Claude and other AI MCP related apps)
// Inform user that they need to install missing apps
// Read all objects and fields
// Find custom workspace app's id (for future references)
// Filter out all those created by apps (inform user about it?)
// Re-create objects and fields using GraphQL API
// Using REST API read all objects and re-create them (what about the order?)

// Notes:
// If a workspace is too large to migrate within timeoutSeconds (900s / 15min, see
// TIMEOUT_SECONDS in utils/time-budget.util.ts), handler() checks its own elapsed runtime
// between stages (and between objects within Stage 5) and returns early once the budget is
// nearly exhausted, rather than letting the platform kill it mid-request - the SDK gives a
// function no way to read a deadline/AbortSignal from its execution context, so this is
// self-tracked via Date.now(), started once via startTimeBudget() at the top of handler().
// Either way (self-stopped or platform-killed), progress is checkpointed (see below) so the
// next invocation knows where it left off, but nothing in this file currently reads that
// checkpoint back to SKIP already-completed work. Records already created stay created;
// re-running is not idempotent (no dedupe by source id).
// Rate limiting against the 140k/280k-records-per-15min quota is handled reactively: writes
// are wrapped in executeWithRetryAndCheckpoint, which backs off and retries on
// 429/502/503/504/network errors (via executeWithRetry) instead of pacing every request with a
// fixed delay, and also counts requests toward the periodic checkpoint.
//
// State and checkpointing: cross-stage data (recordIdMap, targetObjectIdBySourceObjectId, ...)
// lives in the shared `migrationState` singleton (utils/migration-state.util.ts) rather than as
// local variables closed over by handler() - stages read/write it via setStateRef so the same
// mechanism works whether a stage's logic is still inline here or has been extracted to its own
// file (see stages/stage1.ts). It's persisted to this app's own key-value store (kv, scoped to
// this app install in whichever workspace is running it - durable across separate invocations
// of this logic function) as a JSON snapshot, both after every stage completes and every 49
// requests (the 50th "request" in the sequence is spent persisting the checkpoint instead of
// migration work) - this bounds how much progress-tracking granularity could be lost if the
// run is cut off mid-stage, since stages like record migration can span thousands of requests.

// 5s (axios' default-ish) is fine for a single-record write, but FindAllObjectsAndFields fetches
// every object and field (including nested relation/morphRelations) for a whole workspace in one
// response - for a large workspace (hundreds of objects, thousands of fields) that can genuinely
// take longer than 5s to resolve and transfer, which would otherwise throw an uncaught timeout
// before any comparison logic runs.
const API_CLIENT_TIMEOUT_MS = 60 * 1000;

const handler = async () => {
  startTimeBudget();

  const targetWorkspace = axios.create({
    baseURL: `${process.env.TARGET_WORKSPACE_API_URL}`,
    timeout: API_CLIENT_TIMEOUT_MS,
    headers: {
      'Authorization': `Bearer ${process.env.TARGET_WORKSPACE_API_KEY}`,
    }
  });
  const sourceWorkspace = axios.create({
    baseURL: `${process.env.SOURCE_WORKSPACE_API_URL}`,
    timeout: API_CLIENT_TIMEOUT_MS,
    headers: {
      'Authorization': `Bearer ${process.env.SOURCE_WORKSPACE_API_KEY}`,
    }
  });
  const currentWorkspace = await fetchCurrentWorkspace(sourceWorkspace);
  const MAX_REQUESTS = (currentWorkspace.length === 1 && currentWorkspace[0].metadata.plan === 'PRO') ? 50 : 100;
  setStateRef('maxRequests', MAX_REQUESTS);
  switch (migrationState.stage) {
    case 1:
      await stage1(sourceWorkspace, targetWorkspace);
      break;
    case 2:
      await stage2(sourceWorkspace, targetWorkspace);
      break;
    case 3:
      await stage3(sourceWorkspace, targetWorkspace);
      break;
    case 4:
      await stage4(sourceWorkspace, targetWorkspace);
      break;
    case 5:
      await stage5(sourceWorkspace, targetWorkspace);
      break;
    case 6:
      await stage6(sourceWorkspace, targetWorkspace);
      break;
    case 7:
      await stage7(sourceWorkspace, targetWorkspace);
      break;
  }
  return;
};

export default defineLogicFunction({
  universalIdentifier: 'b058e57c-4ac6-4b18-b147-9099260da9de',
  name: 'entry-point',
  description: 'Add a description for your logic function',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler,
  httpRouteTriggerSettings: {
     path: TRIGGER_ROUTE_PATH,
     httpMethod: 'POST',
     isAuthRequired: true,
  },
});
