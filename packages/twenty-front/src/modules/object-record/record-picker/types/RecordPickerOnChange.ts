import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';

export type RecordPickerOnChange = (
  morphItem: RecordPickerPickableMorphItem,
) => void | Promise<void>;
