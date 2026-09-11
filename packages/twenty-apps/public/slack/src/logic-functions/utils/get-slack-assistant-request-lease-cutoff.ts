import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';

// An execution cannot outlive its timeout, so a PROCESSING record untouched
// for longer than that has no live owner and can be taken over.
export const getSlackAssistantRequestLeaseCutoff = (
  nowMs: number = Date.now(),
): Date => new Date(nowMs - SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000);
