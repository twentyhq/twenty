import { type SlackAssistantStatusStep } from 'src/logic-functions/types/slack-assistant-status-step.type';

export const SLACK_ASSISTANT_INITIAL_STATUS = 'is thinking…';

export const SLACK_ASSISTANT_STATUS_STEPS: SlackAssistantStatusStep[] = [
  { afterSeconds: 30, text: 'is digging through your CRM…' },
  { afterSeconds: 90, text: 'is still on it, thanks for waiting…' },
  { afterSeconds: 180, text: 'is wrapping up…' },
];
