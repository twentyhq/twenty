import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const shouldWorkflowRefetchRequestFamilyState = createFamilyStateV2<
  boolean,
  string
>({
  key: 'shouldWorkflowRefetchRequestFamilyState',
  defaultValue: false,
});
