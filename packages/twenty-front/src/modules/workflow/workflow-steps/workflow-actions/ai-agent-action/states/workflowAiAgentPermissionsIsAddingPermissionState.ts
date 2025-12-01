import { atom } from 'recoil';

export const workflowAiAgentPermissionsIsAddingPermissionState = atom<boolean>({
  key: 'workflowAiAgentPermissionsIsAddingPermissionState',
  default: false,
});
