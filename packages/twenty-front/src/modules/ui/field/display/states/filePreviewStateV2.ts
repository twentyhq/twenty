import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const filePreviewStateV2 = createState<FieldFilesValue | null>({
  key: 'filePreviewStateV2',
  defaultValue: null,
});
