import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { MessageData } from '../types/omnicanal.types';

const MOCK_MESSAGES: MessageData[] = [
  { id: 'M-1', author: 'Carlos Mendez', content: 'Hi, I have a question about my Q1 invoice.', channel: 'email', direction: 'inbound', timestamp: '2026-04-28T10:00:00Z' },
  { id: 'M-2', author: 'Ana Torres', content: 'Of course! Let me pull up your account. One moment.', channel: 'email', direction: 'outbound', timestamp: '2026-04-28T10:15:00Z' },
  { id: 'M-3', author: 'Ana Torres', content: 'I see the invoice was generated on March 31. Could you clarify which line item looks incorrect?', channel: 'email', direction: 'outbound', timestamp: '2026-04-28T10:16:00Z' },
  { id: 'M-4', author: 'Carlos Mendez', content: 'The API add-on charge seems duplicated.', channel: 'email', direction: 'inbound', timestamp: '2026-04-28T14:30:00Z' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  max-width: 640px;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledThread = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBubble = styled.div<{ isOutbound: boolean }>`
  max-width: 80%;
  align-self: ${({ isOutbound }) => (isOutbound ? 'flex-end' : 'flex-start')};
  padding: ${themeCssVariables.spacing[3]};
  border-radius: 12px;
  background: ${({ isOutbound }) =>
    isOutbound ? themeCssVariables.color.blue : themeCssVariables.background.transparent.lighter};
  color: ${({ isOutbound }) =>
    isOutbound ? themeCssVariables.font.color.inverted : themeCssVariables.font.color.primary};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 95%;
  }
`;

const StyledAuthor = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  display: block;
  margin-bottom: 4px;
`;

const StyledBody = styled.span`
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledTime = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  display: block;
  margin-top: 4px;
`;

export const ConversationView = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Conversation`}</StyledTitle>
      <StyledThread>
        {MOCK_MESSAGES.map((message) => (
          <StyledBubble key={message.id} isOutbound={message.direction === 'outbound'}>
            <StyledAuthor>{message.author}</StyledAuthor>
            <StyledBody>{message.content}</StyledBody>
            <StyledTime>{new Date(message.timestamp).toLocaleTimeString()}</StyledTime>
          </StyledBubble>
        ))}
      </StyledThread>
    </StyledContainer>
  );
};
