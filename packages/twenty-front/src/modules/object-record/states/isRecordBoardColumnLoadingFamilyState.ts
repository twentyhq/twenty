import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const isRecordIndexBoardColumnLoadingFamilyState = createFamilyStateV2<
  boolean,
  string | undefined
>({
  key: 'isRecordIndexBoardColumnLoadingFamilyState',
  defaultValue: false,
});
