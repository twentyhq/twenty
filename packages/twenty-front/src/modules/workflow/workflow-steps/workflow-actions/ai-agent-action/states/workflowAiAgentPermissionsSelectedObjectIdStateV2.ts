import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workflowAiAgentPermissionsSelectedObjectIdStateV2 = createStateV2<
  string | undefined
>({
  key: 'workflowAiAgentPermissionsSelectedObjectIdStateV2',
  defaultValue: undefined,
});
