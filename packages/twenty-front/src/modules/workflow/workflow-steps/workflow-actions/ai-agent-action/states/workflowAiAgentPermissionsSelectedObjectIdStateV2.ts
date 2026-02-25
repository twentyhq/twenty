import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentPermissionsSelectedObjectIdStateV2 =
  createAtomState<string | undefined>({
    key: 'workflowAiAgentPermissionsSelectedObjectIdStateV2',
    defaultValue: undefined,
  });
