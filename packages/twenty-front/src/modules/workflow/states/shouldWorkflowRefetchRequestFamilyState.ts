import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const shouldWorkflowRefetchRequestFamilyState = createFamilyState<
  boolean,
  string
>({
  key: 'shouldWorkflowRefetchRequestFamilyState',
  defaultValue: false,
});
