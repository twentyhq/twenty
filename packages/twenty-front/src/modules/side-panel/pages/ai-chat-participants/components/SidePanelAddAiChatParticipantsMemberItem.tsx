import { ListItemButton } from 'twenty-ui/components/navigation';

import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { SidePanelAiChatParticipantsMemberAvatar } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsMemberAvatar';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

type SidePanelAddAiChatParticipantsMemberItemProps = {
  workspaceMember: PartialWorkspaceMember;
  label: string;
  isChecked: boolean;
  onToggle: () => void;
};

export const SidePanelAddAiChatParticipantsMemberItem = ({
  workspaceMember,
  label,
  isChecked,
  onToggle,
}: SidePanelAddAiChatParticipantsMemberItemProps) => {
  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(workspaceMember.id);

  return (
    <ListItemButton
      ref={nativeItemRef}
      indicator="checkbox"
      selected={isChecked}
      focused={isSelectedItemId}
      startIcon={
        <SidePanelAiChatParticipantsMemberAvatar
          workspaceMember={workspaceMember}
        />
      }
      aria-pressed={isChecked}
      onClick={onToggle}
      onFocus={handleFocus}
    >
      {label}
    </ListItemButton>
  );
};
