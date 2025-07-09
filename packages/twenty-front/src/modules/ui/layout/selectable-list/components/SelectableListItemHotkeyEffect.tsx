import { useSelectableListListenToEnterHotkeyOnItem } from '@/ui/layout/selectable-list/hooks/useSelectableListListenToEnterHotkeyOnItem';
import { useSelectableListContextOrThrow } from '@/ui/layout/selectable-list/states/contexts/SelectableListContext';

export const SelectableListItemHotkeyEffect = ({
  itemId,
  onEnter,
}: {
  itemId: string;
  onEnter: () => void;
}) => {
  const { focusId } = useSelectableListContextOrThrow();

  useSelectableListListenToEnterHotkeyOnItem({
    focusId,
    itemId,
    onEnter,
  });

  return null;
};
