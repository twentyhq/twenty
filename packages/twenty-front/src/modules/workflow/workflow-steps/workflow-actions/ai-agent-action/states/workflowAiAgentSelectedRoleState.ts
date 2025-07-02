import { atom } from 'recoil';

export const workflowAiAgentSelectedRoleState = atom<string | undefined>({
  key: 'workflowAiAgentSelectedRoleState',
  default: undefined,
});
