export type TeamsAssistantFeedbackResult =
  | { skipped: true; reason: string }
  | { done: true };
