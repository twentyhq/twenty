import { RecordPickerInitialLoadingEmptyContainer } from '@/object-record/record-picker/components/RecordPickerInitialLoadingEmptyContainer';
import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { RecordPickerNoRecordFoundMenuItem } from '@/object-record/record-picker/components/RecordPickerNoRecordFoundMenuItem';
import { MultipleRecordPickerFetchMoreLoader } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerFetchMoreLoader';
import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';

type MultipleRecordPickerMenuItemsProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
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

  const pickableRecordIds = useRecoilComponentValue(
    multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector,
    componentInstanceId,
  );

  const multipleRecordPickerPickableMorphItemsState =
    useRecoilComponentCallbackState(
      multipleRecordPickerPickableMorphItemsComponentState,
      componentInstanceId,
    );

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) => {
      return (morphItem: RecordPickerPickableMorphItem) => {
        const previousMorphItems = snapshot
          .getLoadable(multipleRecordPickerPickableMorphItemsState)
          .getValue();

        const existingMorphItemIndex = previousMorphItems.findIndex(
          (item) => item.recordId === morphItem.recordId,
        );

        const newMorphItems = [...previousMorphItems];

        if (existingMorphItemIndex === -1) {
          newMorphItems.push(morphItem);
        } else {
          newMorphItems[existingMorphItemIndex] = morphItem;
        }

        set(multipleRecordPickerPickableMorphItemsState, newMorphItems);
      };
    },
    [multipleRecordPickerPickableMorphItemsState],
  );

  const multipleRecordPickerShouldShowInitialLoading = useRecoilComponentValue(
    multipleRecordPickerShouldShowInitialLoadingComponentState,
  );

  const multipleRecordPickerShouldShowSkeleton = useRecoilComponentValue(
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
                  handleChange(morphItem);
                  onChange?.(morphItem);
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
