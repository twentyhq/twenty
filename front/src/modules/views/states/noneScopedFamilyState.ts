import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const noneScopedFamilyState = createScopedFamilyState<any, string>({
  key: 'noneScopedFamilyState',
  defaultValue: null,
});
