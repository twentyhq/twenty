import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const cursorFamilyState = createFamilyState<string, string | undefined>({
  key: 'cursorFamilyState',
  defaultValue: '',
});
