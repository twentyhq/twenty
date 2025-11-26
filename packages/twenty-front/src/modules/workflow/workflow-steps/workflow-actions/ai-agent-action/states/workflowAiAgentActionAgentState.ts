import { atomFamily } from 'recoil';
import { type Agent } from '~/generated-metadata/graphql';

export const workflowAiAgentActionAgentState = atomFamily<
  Agent | undefined,
  string
>({
  key: 'workflowAiAgentActionAgentState',
  default: undefined,
});
