export type CallerVariant =
  | 'session'
  | 'impersonatedSession'
  | 'playgroundSession'
  | 'workspaceAgnosticSession'
  | 'apiKey'
  | 'oauthClientWithUser'
  | 'oauthClientWithoutUser'
  | 'applicationWithUser'
  | 'applicationWithoutUser';
