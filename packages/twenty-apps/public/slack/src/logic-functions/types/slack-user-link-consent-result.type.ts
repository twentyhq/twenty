export type SlackUserLinkConsentResult =
  | { done: true; messageUpdateError?: string }
  | { skipped: true; reason: string };
