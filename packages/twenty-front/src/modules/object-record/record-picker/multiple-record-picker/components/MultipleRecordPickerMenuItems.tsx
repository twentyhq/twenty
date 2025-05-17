import styled from '@emotion/styled';

import { MultipleRecordPickerFetchMoreLoader } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerFetchMoreLoader';
import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerHasMoreSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPaginationSelectors';
import { multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';

export const StyledSelectableItem = styled(SelectableListItem)`
  height: 100%;
  width: 100%;
`;

const StyledEmptyText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
`;

type MultipleRecordPickerMenuItemsProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
};

export const MultipleRecordPickerMenuItems = ({
  onChange,
}: MultipleRecordPickerMenuItemsProps) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const pickableRecordIds = useRecoilComponentValueV2(
    multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector,
    componentInstanceId,
  );

  const hasMore = useRecoilComponentValueV2(
    multipleRecordPickerHasMoreSelector,
    componentInstanceId,
  );

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const multipleRecordPickerPickableMorphItemsState =
    useRecoilComponentCallbackStateV2(
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

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      {pickableRecordIds.length === 0 ? (
        <StyledEmptyText>No results found</StyledEmptyText>
      ) : (
        <SelectableList
          selectableListInstanceId={selectableListComponentInstanceId}
          selectableItemIdArray={pickableRecordIds}
          hotkeyScope={MultipleRecordPickerHotkeyScope.MultipleRecordPicker}
        >
          {pickableRecordIds.map((recordId) => {
            return (
              <MultipleRecordPickerMenuItem
                key={recordId}
                recordId={recordId}
                onChange={(morphItem) => {
                  handleChange(morphItem);
                  onChange?.(morphItem);
                  resetSelectedItem();
                }}
              />
            );
          })}
          {hasMore && <MultipleRecordPickerFetchMoreLoader />}
        </SelectableList>
      )}
    </DropdownMenuItemsContainer>
  );
};
