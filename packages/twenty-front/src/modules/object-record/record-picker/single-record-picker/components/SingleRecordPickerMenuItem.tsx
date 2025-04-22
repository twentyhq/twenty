import styled from '@emotion/styled';

import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { Avatar } from 'twenty-ui/display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

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

  const isSelectedItemId = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    record.id,
    selectableListComponentInstanceId,
  );

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
