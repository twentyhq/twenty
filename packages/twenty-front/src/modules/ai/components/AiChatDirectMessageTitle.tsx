import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getInboxDirectMessagePeerWorkspaceMemberIds } from '@/ai/utils/getAgentChatDirectMessagePeerWorkspaceMemberIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

type InboxDirectMessageTitleProps = {
  threadId: string;
};

export const InboxDirectMessageTitle = ({
  threadId,
}: InboxDirectMessageTitleProps) => {
  const { t } = useLingui();
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const [peerWorkspaceMemberId] = isDefined(thread)
    ? getInboxDirectMessagePeerWorkspaceMemberIds({
        thread,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
      })
    : [];
  const peerWorkspaceMember = currentWorkspaceMembers.find(
    ({ id }) => id === peerWorkspaceMemberId,
  );
  const peerName = isDefined(peerWorkspaceMember)
    ? getWorkspaceMemberNameOrEmail(peerWorkspaceMember)
    : t`Former member`;

  return (
    <StyledTitle>
      <Avatar
        name={peerName}
        src={peerWorkspaceMember?.avatarUrl}
        colorSeed={peerWorkspaceMemberId ?? threadId}
        shape="circle"
        size="md"
      />
      <OverflowingTextWithTooltip text={peerName} />
    </StyledTitle>
  );
};
