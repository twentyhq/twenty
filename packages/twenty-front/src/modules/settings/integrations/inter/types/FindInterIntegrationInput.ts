import { InterIntegration } from '@/settings/integrations/inter/types/InterIntegration';

export type FindInterIntegration = Omit<InterIntegration, 'workspaceId'>;
