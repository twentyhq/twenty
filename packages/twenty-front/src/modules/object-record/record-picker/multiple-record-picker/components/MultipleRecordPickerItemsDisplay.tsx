import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
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

  const isLoading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const itemsLength = useRecoilComponentValueV2(
    multipleRecordPickerPickableMorphItemsLengthComponentSelector,
    componentInstanceId,
  );

  return (
    <>
      <DropdownMenuSeparator />
      {isLoading && itemsLength === 0 ? (
        <DropdownMenuSkeletonItem />
      ) : (
        <MultipleRecordPickerMenuItems onChange={onChange} />
      )}
      <DropdownMenuSeparator />
    </>
  );
};
