export type SlackAssistantRequestWatchdogResult =
  | { isFailed: true; attempt: number; hasReplied: boolean }
  | { isFailed: false; attempt: number; isRescheduled: true }
  | { isFailed: false; attempt: number; isRescheduled: false; reason: string };
