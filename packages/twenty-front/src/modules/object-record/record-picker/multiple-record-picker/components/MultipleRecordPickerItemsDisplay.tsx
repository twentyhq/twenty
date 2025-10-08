import { MultipleRecordPickerLoadingEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerLoadingEffect';
import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

export const MultipleRecordPickerItemsDisplay = ({
  onChange,
  focusId,
  showObjectName,
}: {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  focusId: string;
  showObjectName?: boolean;
}) => {
  return (
    <>
      <MultipleRecordPickerLoadingEffect />
      <DropdownMenuSeparator />
      <MultipleRecordPickerMenuItems
        onChange={onChange}
        focusId={focusId}
        showObjectName={showObjectName}
      />
      <DropdownMenuSeparator />
    </>
  );
};
