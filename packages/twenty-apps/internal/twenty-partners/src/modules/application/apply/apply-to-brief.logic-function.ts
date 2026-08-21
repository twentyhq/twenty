import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { APPLY_TO_BRIEF_FUNCTION_ID } from 'src/modules/application/apply/constants/apply-to-brief.constants';
import {
  applyToBrief,
  type ApplyToBriefResult,
} from 'src/modules/application/apply/services/apply-to-brief.service';

export const handler = (event: RoutePayload<unknown>): Promise<ApplyToBriefResult> =>
  applyToBrief(event);

export default defineLogicFunction({
  universalIdentifier: APPLY_TO_BRIEF_FUNCTION_ID,
  name: 'apply-to-brief',
  description: 'Creates an Application for the calling partner on a listed brief.',
  // Six sequential round trips behind a cold isolate start: a first invocation measured
  // 47s wall on a local dev server, so 20s killed it before the first query returned.
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/apply-to-brief',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
