import { SLACK_ASSISTANT_PLACEHOLDER_TEXT } from 'src/logic-functions/constants/slack-assistant-placeholder-text';
import { SLACK_ASSISTANT_PROGRESS_STEPS } from 'src/logic-functions/constants/slack-assistant-progress-steps';

export const SLACK_ASSISTANT_TRANSIENT_TEXTS = [
  SLACK_ASSISTANT_PLACEHOLDER_TEXT,
  ...SLACK_ASSISTANT_PROGRESS_STEPS.map((step) => step.text),
];
