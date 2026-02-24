import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const recordLoadingFamilyState = createFamilyState<boolean, string>({
  key: 'recordLoadingFamilyState',
  defaultValue: false,
});
