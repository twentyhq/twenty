import { MultipleRecordPickerLoadingEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerLoadingEffect';
import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { type RecordPickerOnChange } from '@/object-record/record-picker/types/RecordPickerOnChange';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

export const MultipleRecordPickerItemsDisplay = ({
  onChange,
  focusId,
}: {
  onChange?: RecordPickerOnChange;
  focusId: string;
}) => {
  return (
    <>
      <MultipleRecordPickerLoadingEffect />
      <DropdownMenuSeparator />
      <MultipleRecordPickerMenuItems onChange={onChange} focusId={focusId} />
      <DropdownMenuSeparator />
    </>
  );
};
