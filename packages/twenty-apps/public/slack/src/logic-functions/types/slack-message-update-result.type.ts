export type SlackMessageUpdateResult =
  | { success: true }
  | { success: false; error: string };
