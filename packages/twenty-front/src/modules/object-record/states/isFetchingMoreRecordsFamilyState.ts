import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const isFetchingMoreRecordsFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'isFetchingMoreRecordsFamilyState',
  defaultValue: false,
});
