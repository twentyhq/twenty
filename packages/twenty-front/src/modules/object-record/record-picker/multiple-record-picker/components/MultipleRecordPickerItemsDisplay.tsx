import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

export const MultipleRecordPickerItemsDisplay = ({
  showLoader,
  onChange,
}: {
  showLoader: boolean;
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
}) => {
  return (
    <>
      <DropdownMenuSeparator />
      {showLoader ? (
        <DropdownMenuSkeletonItem />
      ) : (
        <MultipleRecordPickerMenuItems onChange={onChange} />
      )}
      <DropdownMenuSeparator />
    </>
  );
};
