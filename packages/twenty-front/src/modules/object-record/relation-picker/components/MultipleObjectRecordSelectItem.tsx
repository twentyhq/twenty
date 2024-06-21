import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui';
import { v4 } from 'uuid';

import { objectRecordMultiSelectFamilyState } from '@/object-record/record-field/states/objectRecordMultiSelectFamilyState';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export const MultipleObjectRecordSelectItem = ({
  objectRecordId,
  onChange,
}: {
  objectRecordId: string;
  onChange?: (changedRecordForSelectId: string) => void;
}) => {
  const { isSelectedItemIdSelector } = useSelectableList(
    MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  );

  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(objectRecordId),
  );

  const record = useRecoilValue(
    objectRecordMultiSelectFamilyState(objectRecordId),
  );

  if (!record) {
    return null;
  }

  const handleSelectChange = () => {
    onChange?.(objectRecordId);
  };

  const { selected, recordIdentifier } = record;

  if (!recordIdentifier) {
    return null;
  }

  return (
    <StyledSelectableItem itemId={objectRecordId} key={objectRecordId + v4()}>
      <MenuItemMultiSelectAvatar
        onSelectChange={(_isNewlySelectedValue) => handleSelectChange()}
        isKeySelected={isSelectedByKeyboard}
        selected={selected}
        avatar={
          <Avatar
            avatarUrl={getImageAbsoluteURIOrBase64(recordIdentifier.avatarUrl)}
            entityId={objectRecordId}
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
