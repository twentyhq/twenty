import { InterIntegration } from '@/settings/integrations/inter/types/InterIntegration';

export type UpdateInterIntegrationInput = Omit<
  InterIntegration,
  'workspaceId' | 'workspace' | 'sla' | 'disabled'
>;
