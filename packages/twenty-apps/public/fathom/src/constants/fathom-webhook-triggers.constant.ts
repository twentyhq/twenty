import { type TriggeredFor } from 'fathom-typescript/sdk/models/operations';

// Personal connections follow only their own recordings, so teammates who each
// connect do not all receive, and compete to import, the same team recordings.
export const FATHOM_USER_WEBHOOK_TRIGGERS: TriggeredFor[] = [
  'my_recordings',
  'my_shared_with_team_recordings',
];

export const FATHOM_WORKSPACE_WEBHOOK_TRIGGERS: TriggeredFor[] = [
  'my_recordings',
  'my_shared_with_team_recordings',
  'shared_team_recordings',
];
