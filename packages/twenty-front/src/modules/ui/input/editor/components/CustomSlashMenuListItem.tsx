import { SLASH_MENU_LIST_ID } from '@/ui/input/constants/SlashMenuListId';
import { type SuggestionItem } from '@/ui/input/editor/components/types';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

export type CustomSlashMenuListItemProps = {
  item: SuggestionItem;
};

export const CustomSlashMenuListItem = ({
  item,
}: CustomSlashMenuListItemProps) => {
  const { resetSelectedItem } = useSelectableList(SLASH_MENU_LIST_ID);

  const isSelectedItem = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    item.title,
  );

  const handleClick = () => {
    resetSelectedItem();
    item.onItemClick();
  };

  return (
    <SelectableListItem itemId={item.title} onEnter={handleClick}>
      <MenuItemSuggestion
        selected={isSelectedItem}
        onClick={handleClick}
        LeftIcon={item.Icon}
        text={item.title}
      />
    </SelectableListItem>
  );
};
