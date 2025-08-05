import styled from '@emotion/styled';

import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { Avatar } from 'twenty-ui/display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

type SingleRecordPickerMenuItemProps = {
  record: SingleRecordPickerRecord;
  onRecordSelected: (recordSelected?: SingleRecordPickerRecord) => void;
  selectedRecord?: SingleRecordPickerRecord;
};

const StyledSelectableItem = styled(SelectableListItem)`
  width: 100%;
`;

export const SingleRecordPickerMenuItem = ({
  record,
  onRecordSelected,
  selectedRecord,
}: SingleRecordPickerMenuItemProps) => {
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
    );

  const selectableListComponentInstanceId =
    getSingleRecordPickerSelectableListId(recordPickerComponentInstanceId);

  const isSelectedItemId = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    record.id,
    selectableListComponentInstanceId,
  );

  return (
    <StyledSelectableItem
      itemId={record.id}
      key={record.id}
      onEnter={() => {
        onRecordSelected(record);
      }}
    >
      <MenuItemSelectAvatar
        testId="menu-item"
        onClick={() => onRecordSelected(record)}
        text={record.name}
        selected={selectedRecord?.id === record.id}
        focused={isSelectedItemId}
        avatar={
          <Avatar
            avatarUrl={record.avatarUrl}
            placeholderColorSeed={record.id}
            placeholder={record.name}
            size="md"
            type={record.avatarType ?? 'rounded'}
          />
        }
      />
    </StyledSelectableItem>
  );
};
