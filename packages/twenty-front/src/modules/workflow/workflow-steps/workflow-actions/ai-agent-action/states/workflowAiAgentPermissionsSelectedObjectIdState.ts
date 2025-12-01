import { atom } from 'recoil';

export const workflowAiAgentPermissionsSelectedObjectIdState = atom<
  string | undefined
>({
  key: 'workflowAiAgentPermissionsSelectedObjectIdState',
  default: undefined,
});
