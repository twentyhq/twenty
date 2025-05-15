import { InterIntegration } from '@/settings/integrations/inter/types/InterIntegration';

export type CreateInterIntegrationInput = Omit<
  InterIntegration,
  'id' | 'workspace' | 'workspaceId' | 'disabled'
>;
