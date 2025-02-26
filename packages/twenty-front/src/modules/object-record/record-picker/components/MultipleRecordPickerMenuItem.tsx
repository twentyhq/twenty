import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemMultiSelectAvatar } from 'twenty-ui';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-picker/constants/RecordPickerSelectableListComponentInstanceId';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
  const { isSelectedItemIdSelector } = useSelectableList(
    RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
  );

  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(objectRecordId),
  );
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );

  const {
    objectRecordMultiSelectFamilyState,
    objectRecordMultiSelectCheckedRecordsIdsState,
  } = useObjectRecordMultiSelectScopedStates(instanceId);

  const record = useRecoilValue(
    objectRecordMultiSelectFamilyState(objectRecordId),
  );

  const objectRecordMultiSelectCheckedRecordsIds = useRecoilValue(
    objectRecordMultiSelectCheckedRecordsIdsState,
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

  const selected = objectRecordMultiSelectCheckedRecordsIds.find(
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
