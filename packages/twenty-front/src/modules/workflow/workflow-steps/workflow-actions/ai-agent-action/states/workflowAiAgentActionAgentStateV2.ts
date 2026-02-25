import { type Agent } from '~/generated-metadata/graphql';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentActionAgentStateV2 = createAtomState<
  Agent | undefined
>({
  key: 'workflowAiAgentActionAgentStateV2',
  defaultValue: undefined,
});
