import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workflowAiAgentPermissionsIsAddingPermissionStateV2 =
  createStateV2<boolean>({
    key: 'workflowAiAgentPermissionsIsAddingPermissionStateV2',
    defaultValue: false,
  });
