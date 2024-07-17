import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const cursorByRecordFamilyState = createFamilyState<
  string | null | undefined,
  string
>({
  key: 'cursorByRecordFamilyState',
  defaultValue: null,
});
