import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workflowAiAgentPermissionsIsAddingPermissionStateV2 =
  createState<boolean>({
    key: 'workflowAiAgentPermissionsIsAddingPermissionStateV2',
    defaultValue: false,
  });
