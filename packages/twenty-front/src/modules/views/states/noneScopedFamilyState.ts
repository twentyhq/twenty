import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const noneScopedFamilyState = createComponentFamilyState<any, string>({
  key: 'noneScopedFamilyState',
  defaultValue: null,
});
