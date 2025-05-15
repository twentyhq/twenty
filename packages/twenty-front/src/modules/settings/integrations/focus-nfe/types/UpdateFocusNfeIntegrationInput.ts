import { FocusNfeIntegration } from '@/settings/integrations/focus-nfe/types/FocusNfeIntegration';

export type UpdateFocusNfeIntegrationInput = Omit<
  FocusNfeIntegration,
  'workspaceId' | 'workspace'
>;
