import { createFamilyState } from 'twenty-ui';

export const recordLoadingFamilyState = createFamilyState<boolean, string>({
  key: 'recordLoadingFamilyState',
  defaultValue: false,
});
