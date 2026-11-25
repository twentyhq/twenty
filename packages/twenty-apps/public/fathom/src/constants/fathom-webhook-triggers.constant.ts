import { type TriggeredFor } from 'fathom-typescript/sdk/models/operations';

// Personal connections exclude recordings owned by other team members to avoid duplicate imports.
export const FATHOM_USER_WEBHOOK_TRIGGERS: TriggeredFor[] = [
  'my_recordings',
  'my_shared_with_team_recordings',
];

export const FATHOM_WORKSPACE_WEBHOOK_TRIGGERS: TriggeredFor[] = [
  'my_recordings',
  'my_shared_with_team_recordings',
  'shared_team_recordings',
];
