export type SlackAssistantFeedbackResult =
  | { skipped: true; reason: string }
  | { done: true };
