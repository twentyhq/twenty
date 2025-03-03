import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemSelectAvatar } from 'twenty-ui';

import { RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-picker/constants/RecordPickerSelectableListComponentInstanceId';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/types/SingleRecordPickerRecord';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

type SingleRecordPickerMenuItemProps = {
  record: SingleRecordPickerRecord;
  onRecordSelected: (recordSelected?: SingleRecordPickerRecord) => void;
  selectedRecord?: SingleRecordPickerRecord;
};

const StyledSelectableItem = styled(SelectableItem)`
  width: 100%;
`;

export const SingleRecordPickerMenuItem = ({
  record,
  onRecordSelected,
  selectedRecord,
}: SingleRecordPickerMenuItemProps) => {
  const { isSelectedItemIdSelector } = useSelectableList(
    RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
  );

  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(record.id));
  return (
    <StyledSelectableItem itemId={record.id} key={record.id}>
      <MenuItemSelectAvatar
        key={record.id}
        testId="menu-item"
        onClick={() => onRecordSelected(record)}
        text={record.name}
        selected={selectedRecord?.id === record.id}
        hovered={isSelectedItemId}
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
