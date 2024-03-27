import { createFamilyState } from 'twenty-ui';

export const isInlineCellInEditModeScopedState = createFamilyState<
  boolean,
  string
>({
  key: 'isInlineCellInEditModeScopedState',
  defaultValue: false,
});
