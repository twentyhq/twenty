import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const stepsOutputSchemaLocaleFamilyState = createAtomFamilyState<
  string | null,
  string | undefined
>({
  key: 'stepsOutputSchemaLocaleFamilyState',
  defaultValue: null,
});
