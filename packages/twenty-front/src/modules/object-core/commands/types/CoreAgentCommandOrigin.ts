import { type AppNavigator } from '@/app/contexts/AppNavigatorContext';
import { type CoreAgentCommandTarget } from '@/object-core/commands/types/CoreAgentCommandTarget';

export type CoreAgentCommandOrigin = {
  target: CoreAgentCommandTarget;
  navigator: AppNavigator | null;
  scopeId: string | null;
  surfaceType: 'main' | 'side-panel';
  workspaceId: string | undefined;
  userId: string | undefined;
};
