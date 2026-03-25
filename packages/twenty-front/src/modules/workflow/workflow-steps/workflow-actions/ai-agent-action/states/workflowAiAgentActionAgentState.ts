import { type Agent } from '~/generated-metadata/graphql';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentActionAgentState = createAtomState<
  Agent | undefined
>({
  key: 'workflowAiAgentActionAgentState',
  defaultValue: undefined,
});
