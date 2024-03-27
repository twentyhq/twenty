import { createFamilyState } from 'twenty-ui';

export const cursorFamilyState = createFamilyState<string, string | undefined>({
  key: 'cursorFamilyState',
  defaultValue: '',
});
