import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workflowAiAgentPermissionsSelectedObjectIdStateV2 = createState<
  string | undefined
>({
  key: 'workflowAiAgentPermissionsSelectedObjectIdStateV2',
  defaultValue: undefined,
});
