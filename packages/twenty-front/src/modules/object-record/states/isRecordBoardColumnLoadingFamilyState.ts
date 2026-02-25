import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const isRecordIndexBoardColumnLoadingFamilyState = createAtomFamilyState<
  boolean,
  string | undefined
>({
  key: 'isRecordIndexBoardColumnLoadingFamilyState',
  defaultValue: false,
});
