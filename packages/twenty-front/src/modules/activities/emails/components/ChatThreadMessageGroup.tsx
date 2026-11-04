import { styled } from '@linaria/react';
import Linkify from 'linkify-react';

import { StyledChatMessageBubble } from '@/activities/emails/components/StyledChatMessageBubble';
import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { MessageChannelVisibility } from '~/generated/graphql';
import { beautifyExactDateTime } from '~/utils/date-utils';

const StyledGroup = styled.div<{ isOutgoing: boolean }>`
  align-items: ${({ isOutgoing }) => (isOutgoing ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSenderRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSentAt = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ChatThreadMessageGroupProps = {
  group: ChatMessageGroup;
};

export const ChatThreadMessageGroup = ({
  group,
}: ChatThreadMessageGroupProps) => {
  const [firstMessage] = group.messages;

  return (
    <StyledGroup isOutgoing={group.isOutgoing}>
      {!group.isOutgoing && (
        <StyledSenderRow>
          {isDefined(firstMessage.sender) && (
            <ParticipantChip participant={firstMessage.sender} variant="bold" />
          )}
          {isDefined(firstMessage.receivedAt) && (
            <StyledSentAt>
              {beautifyExactDateTime(firstMessage.receivedAt)}
            </StyledSentAt>
          )}
        </StyledSenderRow>
      )}
      {group.messages.map((message) =>
        isFieldValueRestricted(message.text) ? (
          <EmailThreadNotShared
            key={message.id}
            visibility={MessageChannelVisibility.METADATA}
          />
        ) : (
          <StyledChatMessageBubble
            key={message.id}
            isOutgoing={group.isOutgoing}
          >
            <Linkify options={{ target: '_blank', rel: 'noopener noreferrer' }}>
              {message.text}
            </Linkify>
          </StyledChatMessageBubble>
        ),
      )}
    </StyledGroup>
  );
};
