import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const recordLoadingFamilyState = createAtomFamilyState<boolean, string>({
  key: 'recordLoadingFamilyState',
  defaultValue: false,
});
