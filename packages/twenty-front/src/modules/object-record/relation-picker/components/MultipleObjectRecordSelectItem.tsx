import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { isDefined } from '~/utils/isDefined';

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
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );

  const {
    objectRecordMultiSelectFamilyState,
    objectRecordMultiSelectCheckedRecordsIdsState,
  } = useObjectRecordMultiSelectScopedStates(scopeId);

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
