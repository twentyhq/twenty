import { atom } from 'recoil';
import { type Agent } from '~/generated-metadata/graphql';

export const workflowAiAgentActionAgentState = atom<Agent | undefined>({
  key: 'workflowAiAgentActionAgentState',
  default: undefined,
});
