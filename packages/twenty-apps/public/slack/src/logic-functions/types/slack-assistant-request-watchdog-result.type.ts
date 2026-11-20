export type SlackAssistantRequestWatchdogResult =
  | { failed: true; attempt: number; replied: boolean }
  | { failed: false; attempt: number; rescheduled: true }
  | { failed: false; attempt: number; rescheduled: false; reason: string };
