import { type TriggeredFor } from 'fathom-typescript/sdk/models/operations';

// Personal connections skip team recordings so teammates do not all import the same ones.
export const FATHOM_USER_WEBHOOK_TRIGGERS: TriggeredFor[] = [
  'my_recordings',
  'my_shared_with_team_recordings',
];

export const FATHOM_WORKSPACE_WEBHOOK_TRIGGERS: TriggeredFor[] = [
  'my_recordings',
  'my_shared_with_team_recordings',
  'shared_team_recordings',
];
