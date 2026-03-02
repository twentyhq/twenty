import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const shouldRecomputeOutputSchemaFamilyState = createAtomFamilyState<
  boolean,
  string | undefined
>({
  key: 'shouldRecomputeOutputSchemaFamilyState',
  defaultValue: true,
});
