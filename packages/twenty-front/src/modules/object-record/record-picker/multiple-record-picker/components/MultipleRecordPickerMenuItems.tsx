import styled from '@emotion/styled';

import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableRecordIdsComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsComponentSelector';
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
import { isDefined } from 'twenty-shared';

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
    multipleRecordPickerPickableRecordIdsComponentSelector,
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

  const handleEnter = useRecoilCallback(
    ({ snapshot }) => {
      return (selectedId: string) => {
        const pickableMorphItem = snapshot
          .getLoadable(singlePickableMorphItemFamilySelector(selectedId))
          .getValue();

        if (!isDefined(pickableMorphItem)) {
          return;
        }

        onChange?.(pickableMorphItem);
        resetSelectedItem();
      };
    },
    [onChange, resetSelectedItem, singlePickableMorphItemFamilySelector],
  );

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      <SelectableList
        selectableListId={selectableListComponentInstanceId}
        selectableItemIdArray={pickableRecordIds}
        hotkeyScope={MultipleRecordPickerHotkeyScope.MultipleRecordPicker}
        onEnter={handleEnter}
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
