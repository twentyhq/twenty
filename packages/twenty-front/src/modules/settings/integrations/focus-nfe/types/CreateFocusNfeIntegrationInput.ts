import { FocusNfeIntegration } from '@/settings/integrations/focus-nfe/types/FocusNfeIntegration';

export type CreateFocusNfeIntegrationInput = Omit<
  FocusNfeIntegration,
  'id' | 'workspace' | 'workspaceId' | 'disabled'
>;
