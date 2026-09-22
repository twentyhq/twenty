import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { SuggestionRow } from '@/ui/suggestion/components/SuggestionRow';
import { SLASH_MENU_LIST_ID } from '@/ui/input/constants/SlashMenuListId';
import { type SuggestionItem } from '@/blocknote-editor/types/types';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

type CustomSlashMenuListItemProps = {
  item: SuggestionItem;
};

export const CustomSlashMenuListItem = ({
  item,
}: CustomSlashMenuListItemProps) => {
  const { resetSelectedItem } = useSelectableList(SLASH_MENU_LIST_ID);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    item.title,
  );

  const handleClick = () => {
    resetSelectedItem();
    item.onItemClick();
  };

  return (
    <SelectableListItem itemId={item.title} onEnter={handleClick}>
      <SuggestionRow
        selected={isSelectedItemId}
        onSelect={handleClick}
        startIcon={<ListItemIcon icon={item.Icon} />}
      >
        {item.title}
      </SuggestionRow>
    </SelectableListItem>
  );
};
