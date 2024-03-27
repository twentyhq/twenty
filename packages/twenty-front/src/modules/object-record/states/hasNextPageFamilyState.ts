import { createFamilyState } from 'twenty-ui';

export const hasNextPageFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'hasNextPageFamilyState',
  defaultValue: false,
});
