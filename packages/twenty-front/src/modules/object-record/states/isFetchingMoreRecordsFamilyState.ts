import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const isFetchingMoreRecordsFamilyState = createAtomFamilyState<
  boolean,
  string | undefined
>({
  key: 'isFetchingMoreRecordsFamilyState',
  defaultValue: false,
});
