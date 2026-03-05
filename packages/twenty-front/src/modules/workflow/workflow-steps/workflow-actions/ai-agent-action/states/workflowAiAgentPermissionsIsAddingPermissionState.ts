import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentPermissionsIsAddingPermissionState =
  createAtomState<boolean>({
    key: 'workflowAiAgentPermissionsIsAddingPermissionState',
    defaultValue: false,
  });
