import { type ReactNode } from 'react';
import { ListItemButton } from 'twenty-ui/components/navigation';

import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';

type SidePanelMoveAiChatToChannelItemProps = {
  id: string;
  icon: ReactNode;
  label: string;
  isCurrent: boolean;
  onSelect: () => void;
};

export const SidePanelMoveAiChatToChannelItem = ({
  id,
  icon,
  label,
  isCurrent,
  onSelect,
}: SidePanelMoveAiChatToChannelItemProps) => {
  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(id);

  return (
    <ListItemButton
      ref={nativeItemRef}
      indicator="check"
      selected={isCurrent}
      focused={isSelectedItemId}
      startIcon={<ListItemIconContainer>{icon}</ListItemIconContainer>}
      role="option"
      aria-selected={isCurrent}
      onClick={onSelect}
      onFocus={handleFocus}
    >
      {label}
    </ListItemButton>
  );
};
