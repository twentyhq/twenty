import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const mergePreviewRecordFamilyState = createFamilyState<
  ObjectRecord | null,
  string
>({
  key: 'mergePreviewRecordFamilyState',
  defaultValue: null,
});
