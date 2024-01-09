import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const noneScopedFamilyState = createFamilyStateScopeMap<any, string>({
  key: 'noneScopedFamilyState',
  defaultValue: null,
});
