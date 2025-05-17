import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingInitialSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPaginationSelectors';
import { multipleRecordPickerPickableMorphItemsLengthComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableMorphItemsLengthComponentSelector';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const MultipleRecordPickerItemsDisplay = ({
  onChange,
}: {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
}) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const isLoadingInitial = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingInitialSelector,
    componentInstanceId,
  );

  const itemsLength = useRecoilComponentValueV2(
    multipleRecordPickerPickableMorphItemsLengthComponentSelector,
    componentInstanceId,
  );

  return (
    <>
      <DropdownMenuSeparator />
      {isLoadingInitial && itemsLength === 0 ? (
        <DropdownMenuSkeletonItem />
      ) : (
        <MultipleRecordPickerMenuItems onChange={onChange} />
      )}
      <DropdownMenuSeparator />
    </>
  );
};
