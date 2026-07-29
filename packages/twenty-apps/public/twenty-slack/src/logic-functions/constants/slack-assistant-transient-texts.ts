import { SLACK_ASSISTANT_PLACEHOLDER_TEXT } from 'src/logic-functions/constants/slack-assistant-placeholder-text';
import { SLACK_ASSISTANT_PROGRESS_STEPS } from 'src/logic-functions/constants/slack-assistant-progress-steps';

// a request that arrives while another one is still running sees the other
// run's placeholder in the thread, which is noise rather than conversation
export const SLACK_ASSISTANT_TRANSIENT_TEXTS = [
  SLACK_ASSISTANT_PLACEHOLDER_TEXT,
  ...SLACK_ASSISTANT_PROGRESS_STEPS.map((step) => step.text),
];
