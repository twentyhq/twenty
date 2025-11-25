import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type WorkflowAiAgentPermissionsViewMode =
  | 'home'
  | 'add-permission-objects'
  | 'add-permission-crud';

export const workflowAiAgentPermissionsViewModeFamilyState = createFamilyState<
  WorkflowAiAgentPermissionsViewMode,
  string
>({
  key: 'workflowAiAgentPermissionsViewModeFamilyState',
  defaultValue: 'home',
});
