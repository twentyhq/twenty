import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const filePreviewGalleryFilesState = createAtomState<FieldFilesValue[]>({
  key: 'filePreviewGalleryFilesState',
  defaultValue: [],
});
