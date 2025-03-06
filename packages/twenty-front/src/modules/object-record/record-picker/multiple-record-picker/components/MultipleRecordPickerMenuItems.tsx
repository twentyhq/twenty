import styled from '@emotion/styled';

import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableRecordIdsComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsComponentSelector';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerMenuItemsProps = {
  onChange?: (changedRecordForSelectId: string) => void;
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
    multipleRecordPickerPickableRecordIdsComponentSelector,
    componentInstanceId,
  );

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      <SelectableList
        selectableListId={selectableListComponentInstanceId}
        selectableItemIdArray={pickableRecordIds}
        hotkeyScope={MultipleRecordPickerHotkeyScope.MultipleRecordPicker}
        onEnter={(selectedId) => {
          onChange?.(selectedId);
          resetSelectedItem();
        }}
      >
        {pickableRecordIds.map((recordId) => {
          return (
            <MultipleRecordPickerMenuItem
              key={recordId}
              recordId={recordId}
              onChange={(recordId) => {
                onChange?.(recordId);
                resetSelectedItem();
              }}
            />
          );
        })}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
