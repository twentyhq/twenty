export type SlackDeliverMessageResult =
  | { delivered: true; attempt: number; statusRecorded: boolean }
  | { delivered: false; attempt: number; rescheduled: true }
  | { delivered: false; attempt: number; rescheduled: false; error: string };
