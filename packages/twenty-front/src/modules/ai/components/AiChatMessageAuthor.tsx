import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useChatThreadParticipants } from '@/ai/hooks/useChatThreadParticipants';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledAuthorRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

type AiChatMessageAuthorProps = {
  authorUserWorkspaceId: string | null | undefined;
};

// Only shown in shared threads: in a private thread every user message is
// the reader's own, so naming them adds noise.
export const AiChatMessageAuthor = ({
  authorUserWorkspaceId,
}: AiChatMessageAuthorProps) => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const { participantsWithMember, isSharedThread } = useChatThreadParticipants(
    agentChatDisplayedThread,
  );

  if (!isSharedThread || !isDefined(authorUserWorkspaceId)) {
    return null;
  }

  const author = participantsWithMember.find(
    ({ participant }) => participant.userWorkspaceId === authorUserWorkspaceId,
  );

  if (!isDefined(author)) {
    return null;
  }

  const fullName = getWorkspaceMemberFullName(author.workspaceMember);

  return (
    <StyledAuthorRow>
      <Avatar
        src={author.workspaceMember.avatarUrl}
        name={fullName}
        colorSeed={author.workspaceMember.id}
        size="sm"
        shape="circle"
      />
      <span>{fullName}</span>
    </StyledAuthorRow>
  );
};
