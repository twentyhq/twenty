import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const isInlineCellInEditModeFamilyState = createFamilyState<
  boolean,
  string
>({
  key: 'isInlineCellInEditModeScopedState',
  defaultValue: false,
});
