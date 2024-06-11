import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const isRecordIndexLoadingFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'isRecordIndexLoadingFamilyState',
  defaultValue: false,
});
