import { useSelectableListListenToEnterHotkeyOnItem } from '@/ui/layout/selectable-list/hooks/useSelectableListListenToEnterHotkeyOnItem';

export const SelectableItemHotkeyEffect = ({
  hotkeyScope,
  itemId,
  onEnter,
}: {
  hotkeyScope: string;
  itemId: string;
  onEnter: () => void;
}) => {
  useSelectableListListenToEnterHotkeyOnItem({
    hotkeyScope,
    itemId,
    onEnter,
  });
  return null;
};
