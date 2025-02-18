import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const hasRecordInlineCellDangerBorderScopedState = createFamilyState<
  boolean,
  string
>({
  key: 'hasRecordInlineCellDangerBorderScopedState',
  defaultValue: false,
});
