import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const workflowRefetchRequestedFamilyState = createFamilyState<
  boolean,
  string
>({
  key: 'workflowRefetchRequestedFamilyState',
  defaultValue: false,
});
