import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentPermissionsIsAddingPermissionStateV2 =
  createAtomState<boolean>({
    key: 'workflowAiAgentPermissionsIsAddingPermissionStateV2',
    defaultValue: false,
  });
