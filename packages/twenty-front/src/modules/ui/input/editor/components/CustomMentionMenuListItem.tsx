import { type MouseEvent } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { MENTION_MENU_LIST_ID } from '@/ui/input/constants/MentionMenuListId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

type CustomMentionMenuListItemProps = {
  recordId: string;
  onClick: () => void;
  objectNameSingular: string;
};

export const CustomMentionMenuListItem = ({
  recordId,
  onClick,
  objectNameSingular,
}: CustomMentionMenuListItemProps) => {
  const { resetSelectedItem } = useSelectableList(MENTION_MENU_LIST_ID);

  const isSelectedItem = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    recordId,
  );

  const searchRecord = useRecoilValue(searchRecordStoreFamilyState(recordId));

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const handleClick = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    resetSelectedItem();
    onClick();
  };

  if (!isDefined(searchRecord)) {
    return null;
  }

  return (
    <SelectableListItem itemId={recordId} onEnter={handleClick}>
      <MenuItemSuggestion
        selected={isSelectedItem}
        onClick={handleClick}
        text={`${searchRecord.label}`}
        contextualText={objectMetadataItem.labelSingular}
        contextualTextPosition="left"
        LeftIcon={() => (
          <Avatar
            placeholder={searchRecord.label}
            placeholderColorSeed={recordId}
            avatarUrl={searchRecord.imageUrl}
            type={getAvatarType(objectNameSingular) ?? 'rounded'}
            size="sm"
          />
        )}
      />
    </SelectableListItem>
  );
};
