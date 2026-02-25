import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const filePreviewStateV2 = createAtomState<FieldFilesValue | null>({
  key: 'filePreviewStateV2',
  defaultValue: null,
});
