import { MENTION_MENU_LIST_ID } from '@/ui/input/constants/MentionMenuListId';
import { type MentionItem } from '@/ui/input/editor/components/types';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CustomMentionMenuSelectedIndexSyncEffectProps = {
  items: MentionItem[];
  selectedIndex: number | undefined;
};

export const CustomMentionMenuSelectedIndexSyncEffect = ({
  items,
  selectedIndex,
}: CustomMentionMenuSelectedIndexSyncEffectProps) => {
  const { setSelectedItemId } = useSelectableList(MENTION_MENU_LIST_ID);

  useEffect(() => {
    if (!isDefined(selectedIndex) || !isDefined(items)) return;

    const selectedItem = items[selectedIndex];

    if (isDefined(selectedItem) && isDefined(selectedItem.recordId)) {
      setSelectedItemId(selectedItem.recordId);
    }
  }, [items, selectedIndex, setSelectedItemId]);

  return <></>;
};
