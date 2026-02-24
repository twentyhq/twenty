import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const shouldWorkflowRefetchRequestFamilyState = createFamilyState<
  boolean,
  string
>({
  key: 'shouldWorkflowRefetchRequestFamilyState',
  defaultValue: false,
});
