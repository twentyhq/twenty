import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui';
import { v4 } from 'uuid';

import {
  ObjectRecordAndSelected,
  objectRecordMultiSelectFamilyState,
} from '@/object-record/record-field/states/objectRecordMultiSelectFamilyState';
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
  onChange?: (
    changedRecordForSelectId: string,
    newSelectedValue: boolean,
  ) => void;
}) => {
  console.log('MultipleObjectRecordSelectItem rerender', objectRecordId);
  const { isSelectedItemIdSelector } = useSelectableList(
    MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  );

  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(objectRecordId),
  );

  const { selected, ...record } = useRecoilValue(
    objectRecordMultiSelectFamilyState(objectRecordId),
  ) as ObjectRecordAndSelected;

  const handleSelectChange = useRecoilCallback(
    ({ set }) =>
      (newSelectedValue: boolean) => {
        // const selectedObjectRecordsIds = snapshot
        //   .getLoadable(selectedObjectRecordsIdsState)
        //   .getValue();

        // const record = snapshot
        //   .getLoadable(
        //     objectRecordMultiSelectFamilyState(changedRecordForSelectId),
        //   )
        //   .getValue();

        // const newSelectedRecordsIds = newSelectedValue
        //   ? [...selectedObjectRecordsIds, changedRecordForSelectId]
        //   : selectedObjectRecordsIds.filter(
        //       (selectedRecordId: string) =>
        //         selectedRecordId !== changedRecordForSelectId,
        //     );

        // // const newSelectedRecordsIds = newSelectedValue
        // //   ? [...selectedObjectRecordsIds, changedRecordForSelectId]
        // //   : selectedObjectRecordsIds.filter(
        // //       (selectedRecordId: string) =>
        // //         selectedRecordId !== changedRecordForSelectId,
        // //     );

        // console.log('settingNewSelectedRecordsIds', newSelectedRecordsIds);
        // set(objectRecordMultiSelectFamilyState(objectRecordId), {
        //   ...record,
        //   selected: newSelectedValue,
        // });
        // TODO update selectedObjectRecordsIdsState, needed for activityTarge since we send at submit ? or we need to iterate on the objects and add all those with selected: true

        // set(selectedObjectRecordsIdsState, newSelectedRecordsIds);

        onChange?.(objectRecordId, newSelectedValue);
      },
    [objectRecordId, onChange],
  );

  const { recordIdentifier } = record;

  if (!recordIdentifier) {
    return null;
  }

  return (
    <StyledSelectableItem itemId={objectRecordId} key={objectRecordId + v4()}>
      <MenuItemMultiSelectAvatar
        onSelectChange={(isNewlySelectedValue) =>
          handleSelectChange(isNewlySelectedValue)
        }
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
