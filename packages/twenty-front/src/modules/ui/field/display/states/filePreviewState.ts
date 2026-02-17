import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createState } from '@/ui/utilities/state/utils/createState';

export const filePreviewState = createState<FieldFilesValue | null>({
  key: 'filePreviewState',
  defaultValue: null,
});
