import { RecordPickerInitialLoadingEmptyContainer } from '@/object-record/record-picker/components/RecordPickerInitialLoadingEmptyContainer';
import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { RecordPickerNoRecordFoundMenuItem } from '@/object-record/record-picker/components/RecordPickerNoRecordFoundMenuItem';
import { MultipleRecordPickerFetchMoreLoader } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerFetchMoreLoader';
import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { useMultipleRecordPickerChange } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerChange';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { type RecordPickerOnChange } from '@/object-record/record-picker/types/RecordPickerOnChange';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type MultipleRecordPickerMenuItemsProps = {
  onChange?: RecordPickerOnChange;
  focusId: string;
};

export const MultipleRecordPickerMenuItems = ({
  onChange,
  focusId,
}: MultipleRecordPickerMenuItemsProps) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const pickableRecordIds = useAtomComponentSelectorValue(
    multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector,
    componentInstanceId,
  );

  const { handleChange } = useMultipleRecordPickerChange({ onChange });

  const multipleRecordPickerShouldShowInitialLoading =
    useAtomComponentStateValue(
      multipleRecordPickerShouldShowInitialLoadingComponentState,
    );

  const multipleRecordPickerShouldShowSkeleton = useAtomComponentStateValue(
    multipleRecordPickerShouldShowSkeletonComponentState,
  );

  const searchHasNoResults = pickableRecordIds.length === 0;

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      {multipleRecordPickerShouldShowInitialLoading ? (
        <RecordPickerInitialLoadingEmptyContainer />
      ) : multipleRecordPickerShouldShowSkeleton ? (
        <RecordPickerLoadingSkeletonList />
      ) : searchHasNoResults ? (
        <RecordPickerNoRecordFoundMenuItem />
      ) : (
        <SelectableList
          selectableListInstanceId={selectableListComponentInstanceId}
          selectableItemIdArray={pickableRecordIds}
          focusId={focusId}
        >
          {pickableRecordIds.map((recordId) => {
            return (
              <MultipleRecordPickerMenuItem
                key={recordId}
                recordId={recordId}
                onChange={(morphItem) => {
                  void handleChange(morphItem);
                }}
              />
            );
          })}
          <MultipleRecordPickerFetchMoreLoader />
        </SelectableList>
      )}
    </DropdownMenuItemsContainer>
  );
};
