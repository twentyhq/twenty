import { type SingleRecordPickerMenuItemsProps } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItems';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';

export type SingleRecordPickerMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];
  onCreate?: ((searchInput?: string) => void) | (() => void);
  objectNameSingulars: string[];
  recordPickerInstanceId?: string;
  layoutDirection?: RecordPickerLayoutDirection;
  focusId: string;
} & Pick<
  SingleRecordPickerMenuItemsProps,
  'EmptyIcon' | 'emptyLabel' | 'onCancel' | 'onMorphItemSelected'
>;
