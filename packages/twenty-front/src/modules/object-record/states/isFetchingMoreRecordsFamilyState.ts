import { createFamilyState } from 'twenty-ui';

export const isFetchingMoreRecordsFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'isFetchingMoreRecordsFamilyState',
  defaultValue: false,
});
