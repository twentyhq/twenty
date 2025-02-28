import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemMultiSelectAvatar } from 'twenty-ui';

import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsSelectedComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsSelectedComponentFamilyState';
import { multipleRecordPickerSelectedRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSelectedRecordsIdsComponentState';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export const MultipleRecordPickerMenuItem = ({
  objectRecordId,
  onChange,
}: {
  objectRecordId: string;
  onChange?: (changedRecordForSelectId: string) => void;
}) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { isSelectedItemIdSelector } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(objectRecordId),
  );

  const record = useRecoilComponentFamilyValueV2(
    multipleRecordPickerIsSelectedComponentFamilyState,
    objectRecordId,
    componentInstanceId,
  );

  const selectedRecordsIds = useRecoilComponentValueV2(
    multipleRecordPickerSelectedRecordsIdsComponentState,
    componentInstanceId,
  );

  if (!record) {
    return null;
  }

  const handleSelectChange = () => {
    onChange?.(objectRecordId);
  };

  const { recordIdentifier } = record;

  if (!isDefined(recordIdentifier)) {
    return null;
  }

  const selected = selectedRecordsIds.find(
    (checkedObjectRecord) => checkedObjectRecord === objectRecordId,
  )
    ? true
    : false;

  return (
    <StyledSelectableItem itemId={objectRecordId} key={objectRecordId}>
      <MenuItemMultiSelectAvatar
        onSelectChange={(_isNewlySelectedValue) => handleSelectChange()}
        isKeySelected={isSelectedByKeyboard}
        selected={selected}
        avatar={
          <Avatar
            avatarUrl={recordIdentifier.avatarUrl}
            placeholderColorSeed={objectRecordId}
            placeholder={recordIdentifier.name}
            size="md"
            type={recordIdentifier.avatarType ?? 'rounded'}
          />
        }
        text={recordIdentifier.name}
      />
    </StyledSelectableItem>
  );
};
