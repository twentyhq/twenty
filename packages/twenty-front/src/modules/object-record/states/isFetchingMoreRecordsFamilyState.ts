import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const isFetchingMoreRecordsFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'isFetchingMoreRecordsFamilyState',
  defaultValue: false,
});
