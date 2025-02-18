import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const hasRecordTableCellDangerBorderScopedState = createFamilyState<
  boolean,
  string
>({
  key: 'hasRecordTableCellDangerBorderScopedState',
  defaultValue: false,
});
