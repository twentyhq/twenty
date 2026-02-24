import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const shouldRecomputeOutputSchemaFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'shouldRecomputeOutputSchemaFamilyState',
  defaultValue: true,
});
