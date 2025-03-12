import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemSelectAvatar } from 'twenty-ui';

import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

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
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
    );

  const selectableListComponentInstanceId =
    getSingleRecordPickerSelectableListId(recordPickerComponentInstanceId);

  const { isSelectedItemIdSelector } = useSelectableList(
    selectableListComponentInstanceId,
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
