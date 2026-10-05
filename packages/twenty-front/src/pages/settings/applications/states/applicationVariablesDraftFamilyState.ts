import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const applicationVariablesDraftFamilyState = createAtomFamilyState<
  Record<string, string>,
  string
>({
  key: 'applicationVariablesDraftFamilyState',
  defaultValue: {},
});
