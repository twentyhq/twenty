import { type MouseEvent } from 'react';

import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { MENTION_MENU_LIST_ID } from '@/ui/input/constants/MentionMenuListId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { Avatar } from 'twenty-ui/display';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

type CustomMentionMenuListItemProps = {
  record: ObjectRecord;
  recordId: string;
  onClick: () => void;
  objectNameSingular: string;
};

export const CustomMentionMenuListItem = ({
  record,
  recordId,
  onClick,
  objectNameSingular,
}: CustomMentionMenuListItemProps) => {
  const { resetSelectedItem } = useSelectableList(MENTION_MENU_LIST_ID);

  const isSelectedItem = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    recordId,
  );

  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const handleClick = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    resetSelectedItem();
    onClick();
  };

  return (
    <SelectableListItem itemId={recordId} onEnter={handleClick}>
      <MenuItemSuggestion
        selected={isSelectedItem}
        onClick={handleClick}
        text={recordChipData.name}
        LeftIcon={() => (
          <Avatar
            placeholder={recordChipData.name}
            placeholderColorSeed={record.id}
            avatarUrl={recordChipData.avatarUrl}
            type={recordChipData.avatarType}
            size="sm"
          />
        )}
      />
    </SelectableListItem>
  );
};
