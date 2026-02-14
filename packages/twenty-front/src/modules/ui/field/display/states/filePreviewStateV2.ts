import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const filePreviewStateV2 = createStateV2<FieldFilesValue | null>({
  key: 'filePreviewStateV2',
  defaultValue: null,
});
