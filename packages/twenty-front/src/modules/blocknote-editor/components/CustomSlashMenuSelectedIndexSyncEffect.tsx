import { SLASH_MENU_LIST_ID } from '@/ui/input/constants/SlashMenuListId';
import { type SuggestionItem } from '@/blocknote-editor/types/types';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CustomSlashMenuSelectedIndexSyncEffectProps = {
  items: SuggestionItem[];
  selectedIndex: number | undefined;
};

export const CustomSlashMenuSelectedIndexSyncEffect = ({
  items,
  selectedIndex,
}: CustomSlashMenuSelectedIndexSyncEffectProps) => {
  const { setSelectedItemId } = useSelectableList(SLASH_MENU_LIST_ID);

  useEffect(() => {
    if (!isDefined(selectedIndex)) return;

    const selectedItem = items[selectedIndex];

    if (isDefined(selectedItem)) {
      setSelectedItemId(selectedItem.title);
    }
  }, [items, selectedIndex, setSelectedItemId]);

  return <></>;
};
