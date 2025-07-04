import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const isUpdatingWorkflowFamilyState = createFamilyState<
  boolean | undefined,
  string
>({
  key: 'isUpdatingWorkflowFamilyState',
  defaultValue: undefined,
});
