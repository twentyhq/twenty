export type LogConsoleAppAnalyticsTarget =
  | { scope: 'all-workspaces'; applicationRegistrationId: string }
  | { scope: 'current-workspace'; applicationId: string };
