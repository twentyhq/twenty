import { type CoreAgentMainEditScope } from '@/object-core/agents/types/CoreAgentMainEditScope';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const coreAgentMainEditScopeState =
  createAtomState<CoreAgentMainEditScope | null>({
    key: 'coreAgentMainEditScopeState',
    defaultValue: null,
  });
