import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemSelectAvatar } from 'twenty-ui';

import { SINGLE_RECORD_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleRecordSelectBaseList';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

type SelectableMenuItemSelectProps = {
  record: RecordForSelect;
  onRecordSelected: (recordSelected?: RecordForSelect) => void;
  selectedRecord?: RecordForSelect;
};

const StyledSelectableItem = styled(SelectableItem)`
  width: 100%;
`;

export const SelectableMenuItemSelect = ({
  record,
  onRecordSelected,
  selectedRecord,
}: SelectableMenuItemSelectProps) => {
  const { isSelectedItemIdSelector } = useSelectableList(
    SINGLE_RECORD_SELECT_BASE_LIST,
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
