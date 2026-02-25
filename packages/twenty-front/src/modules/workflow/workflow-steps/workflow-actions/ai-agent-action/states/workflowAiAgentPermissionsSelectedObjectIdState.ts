import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workflowAiAgentPermissionsSelectedObjectIdState = createAtomState<
  string | undefined
>({
  key: 'workflowAiAgentPermissionsSelectedObjectIdState',
  defaultValue: undefined,
});
