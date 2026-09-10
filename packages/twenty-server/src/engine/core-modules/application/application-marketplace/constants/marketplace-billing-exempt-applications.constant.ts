// First-party apps whose logic-function executions do not consume the
// workspace's credits. Call Recorder and Last contact react to per-record
// events during mailbox/calendar import, and Slack runs on every subscribed
// Slack event including messages it never answers; either would otherwise
// drain the free-tier allowance. Explicit chargeCredits calls and AI token
// usage from within a function are billed separately.
export const MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS: string[] = [
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
  '66a504cc-0a75-410e-a43f-cdeae1db1522',
  'a8c47f21-3b9e-4d2a-8f61-9c0e7d4a2b51',
];
