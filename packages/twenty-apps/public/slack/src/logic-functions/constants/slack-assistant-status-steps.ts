import { type SlackAssistantProgressStep } from 'src/logic-functions/types/slack-assistant-progress-step.type';

// Statuses render as "<bot name> <status>" under the composer. Slack clears a
// status 2 minutes after it was set, so steps must stay less than 120s apart
// across the whole 240s worker budget to keep the indicator alive.
export const SLACK_ASSISTANT_INITIAL_STATUS = 'is thinking…';

export const SLACK_ASSISTANT_STATUS_STEPS: SlackAssistantProgressStep[] = [
  { afterSeconds: 30, text: 'is digging through your CRM…' },
  { afterSeconds: 90, text: 'is still on it, thanks for waiting…' },
  { afterSeconds: 180, text: 'is wrapping up…' },
];
