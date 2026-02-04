import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createState } from 'twenty-ui/utilities';

export const filePreviewState = createState<FieldFilesValue | null>({
  key: 'filePreviewState',
  defaultValue: null,
});
