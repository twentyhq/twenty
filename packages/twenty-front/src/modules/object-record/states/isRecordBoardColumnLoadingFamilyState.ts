import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const isRecordIndexBoardColumnLoadingFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'isRecordIndexBoardColumnLoadingFamilyState',
  defaultValue: false,
});
