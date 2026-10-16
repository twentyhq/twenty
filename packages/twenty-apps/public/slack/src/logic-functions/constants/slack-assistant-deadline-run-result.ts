import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { type SlackAssistantAgentRunResult } from 'src/logic-functions/types/slack-assistant-agent-run-result.type';

export const SLACK_ASSISTANT_DEADLINE_RUN_RESULT: SlackAssistantAgentRunResult =
  {
    threadId: null,
    result: null,
    error: SLACK_ASSISTANT_DEADLINE_ERROR,
    success: false,
  };
