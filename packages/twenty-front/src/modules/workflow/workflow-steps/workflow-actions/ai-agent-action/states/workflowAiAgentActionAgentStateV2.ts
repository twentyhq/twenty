import { type Agent } from '~/generated-metadata/graphql';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workflowAiAgentActionAgentStateV2 = createState<Agent | undefined>(
  {
    key: 'workflowAiAgentActionAgentStateV2',
    defaultValue: undefined,
  },
);
