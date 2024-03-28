import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const cursorFamilyState = createFamilyState<string, string | undefined>({
  key: 'cursorFamilyState',
  defaultValue: '',
});
