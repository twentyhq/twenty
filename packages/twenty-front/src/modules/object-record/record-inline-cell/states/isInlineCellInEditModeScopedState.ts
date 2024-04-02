import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const isInlineCellInEditModeScopedState = createFamilyState<
  boolean,
  string
>({
  key: 'isInlineCellInEditModeScopedState',
  defaultValue: false,
});
