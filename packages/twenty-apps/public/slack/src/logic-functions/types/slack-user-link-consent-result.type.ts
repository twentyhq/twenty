export type SlackUserLinkConsentResult =
  | { done: true }
  | { skipped: true; reason: string };
