import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const shouldWorkflowRefetchRequestFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'shouldWorkflowRefetchRequestFamilyState',
  defaultValue: false,
});
