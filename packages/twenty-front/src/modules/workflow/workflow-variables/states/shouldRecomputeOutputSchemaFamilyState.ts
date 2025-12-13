import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const shouldRecomputeOutputSchemaFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'shouldRecomputeOutputSchemaFamilyState',
  defaultValue: true,
});
