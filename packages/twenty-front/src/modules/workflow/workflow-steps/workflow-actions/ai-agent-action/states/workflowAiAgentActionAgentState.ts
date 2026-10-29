import { type FlatAgent } from '@/metadata-store/types/FlatAgent';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentActionAgentState = createAtomState<
  FlatAgent | undefined
>({
  key: 'workflowAiAgentActionAgentState',
  defaultValue: undefined,
});
