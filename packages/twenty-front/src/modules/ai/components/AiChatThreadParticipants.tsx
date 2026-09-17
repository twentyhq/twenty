import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconUsers } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { Avatar, AvatarGroup } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadParticipantsDropdownContent } from '@/ai/components/AiChatThreadParticipantsDropdownContent';
import { useChatThreadParticipants } from '@/ai/hooks/useChatThreadParticipants';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledClickableContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type AiChatThreadParticipantsProps = {
  threadId: string;
};

export const getAiChatThreadParticipantsDropdownId = (threadId: string) =>
  `ai-chat-thread-participants-${threadId}`;

export const AiChatThreadParticipants = ({
  threadId,
}: AiChatThreadParticipantsProps) => {
  const { t } = useLingui();
  const { participantsWithMember, isSharedThread } =
    useChatThreadParticipants(threadId);

  return (
    <Dropdown
      dropdownId={getAiChatThreadParticipantsDropdownId(threadId)}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <StyledClickableContainer>
          {isSharedThread && (
            <AvatarGroup
              avatars={participantsWithMember.map(({ workspaceMember }) => (
                <Avatar
                  key={workspaceMember.id}
                  src={workspaceMember.avatarUrl}
                  name={getWorkspaceMemberFullName(workspaceMember)}
                  colorSeed={workspaceMember.id}
                  size="sm"
                  shape="circle"
                />
              ))}
              maxVisible={3}
            />
          )}
          <IconButton
            size="sm"
            variant="outline"
            aria-label={t`Participants`}
            title={t`Participants`}
          >
            <IconUsers />
          </IconButton>
        </StyledClickableContainer>
      }
      dropdownComponents={
        <AiChatThreadParticipantsDropdownContent threadId={threadId} />
      }
    />
  );
};
