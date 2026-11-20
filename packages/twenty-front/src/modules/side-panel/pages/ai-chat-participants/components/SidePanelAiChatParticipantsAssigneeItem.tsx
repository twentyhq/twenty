import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';
import { IconUserOff } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { SidePanelAiChatParticipantsMemberAvatar } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsMemberAvatar';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelAiChatParticipantsAssigneeItemProps = {
  itemId: string;
  assignee: PartialWorkspaceMember | undefined;
  description: string | undefined;
  disabled: boolean;
  onOpenAssign: () => void;
};

export const SidePanelAiChatParticipantsAssigneeItem = ({
  itemId,
  assignee,
  description,
  disabled,
  onOpenAssign,
}: SidePanelAiChatParticipantsAssigneeItemProps) => {
  const { t } = useLingui();

  return (
    <SelectableListItem itemId={itemId} onEnter={onOpenAssign}>
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
        onClick={onOpenAssign}
      />
    </SelectableListItem>
  );
};
