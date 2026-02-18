import { type Agent } from '~/generated-metadata/graphql';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workflowAiAgentActionAgentStateV2 = createStateV2<
  Agent | undefined
>({
  key: 'workflowAiAgentActionAgentStateV2',
  defaultValue: undefined,
});
