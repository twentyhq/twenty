import styled from '@emotion/styled';

import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
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

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );
  const singlePickableMorphItemFamilySelector =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerSinglePickableMorphItemComponentFamilySelector,
      componentInstanceId,
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

  const handleEnter = useRecoilCallback(
    ({ snapshot }) => {
      return (selectedId: string) => {
        const pickableMorphItem = snapshot
          .getLoadable(singlePickableMorphItemFamilySelector(selectedId))
          .getValue();

        if (!isDefined(pickableMorphItem)) {
          return;
        }

        const selectedMorphItem = {
          ...pickableMorphItem,
          isSelected: !pickableMorphItem.isSelected,
        };

        handleChange(selectedMorphItem);
        onChange?.(selectedMorphItem);
        resetSelectedItem();
      };
    },
    [
      handleChange,
      onChange,
      resetSelectedItem,
      singlePickableMorphItemFamilySelector,
    ],
  );

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      <SelectableList
        selectableListInstanceId={selectableListComponentInstanceId}
        selectableItemIdArray={pickableRecordIds}
        hotkeyScope={MultipleRecordPickerHotkeyScope.MultipleRecordPicker}
        onEnter={handleEnter}
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
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
