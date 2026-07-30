import { type SlackAssistantProgressStep } from 'src/logic-functions/types/slack-assistant-progress-step.type';

export const SLACK_ASSISTANT_PROGRESS_STEPS: SlackAssistantProgressStep[] = [
  { afterSeconds: 5, text: '_Exploring…_' },
  { afterSeconds: 10, text: '_Checking results…_' },
  { afterSeconds: 30, text: '_Still digging through your CRM…_' },
  { afterSeconds: 60, text: '_This takes a while, but still here…_' },
  { afterSeconds: 120, text: '_Still on it, thanks for waiting…_' },
  { afterSeconds: 180, text: '_Almost out of time, wrapping up…_' },
];
