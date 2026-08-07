import { type SlackAssistantProgressStep } from 'src/logic-functions/types/slack-assistant-progress-step.type';

export const SLACK_ASSISTANT_INITIAL_STATUS = 'is thinking…';

export const SLACK_ASSISTANT_STATUS_STEPS: SlackAssistantProgressStep[] = [
  { afterSeconds: 30, text: 'is digging through your CRM…' },
  { afterSeconds: 90, text: 'is still on it, thanks for waiting…' },
  { afterSeconds: 180, text: 'is wrapping up…' },
];
