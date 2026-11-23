import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';
import { IconUserOff } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { SidePanelAiChatParticipantsMemberAvatar } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsMemberAvatar';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelAiChatParticipantsAssigneeItemProps = {
  itemId: string;
  threadId: string;
  assignee: PartialWorkspaceMember | undefined;
  description: string | undefined;
  disabled: boolean;
};

export const SidePanelAiChatParticipantsAssigneeItem = ({
  itemId,
  threadId,
  assignee,
  description,
  disabled,
}: SidePanelAiChatParticipantsAssigneeItemProps) => {
  const { t } = useLingui();
  const { openAssignAiChatInSidePanel } = useOpenAssignAiChatInSidePanel();

  const handleOpenAssign = () => {
    if (!disabled) {
      openAssignAiChatInSidePanel({
        threadIds: [threadId],
        shouldGoBackAfterAssign: true,
      });
    }
  };

  return (
    <SelectableListItem itemId={itemId} onEnter={handleOpenAssign}>
      <CommandMenuItem
        id={itemId}
        label={
          isDefined(assignee)
            ? getWorkspaceMemberNameOrEmail(assignee)
            : t`No assignee`
        }
        description={description}
        Icon={isDefined(assignee) ? undefined : IconUserOff}
        LeftComponent={
          isDefined(assignee) ? (
            <SidePanelAiChatParticipantsMemberAvatar
              workspaceMember={assignee}
            />
          ) : undefined
        }
        hasSubMenu
        disabled={disabled}
        onClick={handleOpenAssign}
      />
    </SelectableListItem>
  );
};
