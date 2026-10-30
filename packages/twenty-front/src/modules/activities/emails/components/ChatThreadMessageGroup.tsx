import { styled } from '@linaria/react';
import Linkify from 'linkify-react';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
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

const StyledBubble = styled.div<{ isOutgoing: boolean }>`
  background: ${({ isOutgoing }) =>
    isOutgoing
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isOutgoing }) =>
      isOutgoing ? 'transparent' : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: 85%;
  overflow-wrap: break-word;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: pre-line;

  a {
    color: inherit;
    text-decoration: underline;
  }
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
      {group.messages.map((message) => (
        <StyledBubble key={message.id} isOutgoing={group.isOutgoing}>
          <Linkify options={{ target: '_blank', rel: 'noopener noreferrer' }}>
            {message.text}
          </Linkify>
        </StyledBubble>
      ))}
    </StyledGroup>
  );
};
