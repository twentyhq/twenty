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
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useCallback } from 'react';
import { useStore } from 'jotai';

type MultipleRecordPickerMenuItemsProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  focusId: string;
};

export const MultipleRecordPickerMenuItems = ({
  onChange,
  focusId,
}: MultipleRecordPickerMenuItemsProps) => {
  const store = useStore();
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const pickableRecordIds = useRecoilComponentSelectorValueV2(
    multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector,
    componentInstanceId,
  );

  const multipleRecordPickerPickableMorphItems =
    useRecoilComponentStateCallbackStateV2(
      multipleRecordPickerPickableMorphItemsComponentState,
      componentInstanceId,
    );

  const handleChange = useCallback(
    (morphItem: RecordPickerPickableMorphItem) => {
      const previousMorphItems = store.get(
        multipleRecordPickerPickableMorphItems,
      );

      const existingMorphItemIndex = previousMorphItems.findIndex(
        (item) => item.recordId === morphItem.recordId,
      );

      const newMorphItems = [...previousMorphItems];

      if (existingMorphItemIndex === -1) {
        newMorphItems.push(morphItem);
      } else {
        newMorphItems[existingMorphItemIndex] = morphItem;
      }

      store.set(multipleRecordPickerPickableMorphItems, newMorphItems);
    },
    [multipleRecordPickerPickableMorphItems, store],
  );

  const multipleRecordPickerShouldShowInitialLoading =
    useRecoilComponentValueV2(
      multipleRecordPickerShouldShowInitialLoadingComponentState,
    );

  const multipleRecordPickerShouldShowSkeleton = useRecoilComponentValueV2(
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
