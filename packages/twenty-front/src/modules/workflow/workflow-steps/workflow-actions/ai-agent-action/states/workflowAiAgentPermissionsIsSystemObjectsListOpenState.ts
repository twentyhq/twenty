import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentPermissionsIsSystemObjectsListOpenState =
  createAtomState<boolean>({
    key: 'workflowAiAgentPermissionsIsSystemObjectsListOpenState',
    defaultValue: false,
  });
