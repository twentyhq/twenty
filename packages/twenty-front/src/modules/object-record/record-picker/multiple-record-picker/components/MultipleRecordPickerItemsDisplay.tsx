import { MultipleRecordPickerLoadingEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerLoadingEffect';
import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { Dropdown } from 'twenty-ui/components/navigation';

export const MultipleRecordPickerItemsDisplay = ({
  onChange,
}: {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
}) => {
  return (
    <>
      <MultipleRecordPickerLoadingEffect />
      <Dropdown.Separator />
      <MultipleRecordPickerMenuItems onChange={onChange} />
      <Dropdown.Separator />
    </>
  );
};
