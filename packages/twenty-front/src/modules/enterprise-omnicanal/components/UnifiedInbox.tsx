import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ChannelType, ConversationData } from '../types/omnicanal.types';

const CHANNEL_ICONS: Record<ChannelType, string> = {
  email: '\u2709',
  sms: '\uD83D\uDCF1',
  whatsapp: '\uD83D\uDCAC',
  chat: '\uD83D\uDDE8',
  social: '\uD83C\uDF10',
  phone: '\u260E',
};

const MOCK_CONVERSATIONS: ConversationData[] = [
  { id: 'CV-1', contactName: 'Carlos Mendez', channel: 'email', subject: 'Invoice question', lastMessage: 'Could you resend the Q1 invoice?', status: 'active', assignee: 'Ana Torres', updatedAt: '2026-04-28T14:30:00Z', unreadCount: 2 },
  { id: 'CV-2', contactName: 'Sofia Garcia', channel: 'whatsapp', subject: 'Demo follow-up', lastMessage: 'When can we schedule the next demo?', status: 'waiting', assignee: 'Luis Reyes', updatedAt: '2026-04-28T11:00:00Z', unreadCount: 0 },
  { id: 'CV-3', contactName: 'Pedro Ruiz', channel: 'chat', subject: 'Login issue', lastMessage: 'Still unable to login after reset', status: 'active', assignee: 'Ana Torres', updatedAt: '2026-04-28T15:00:00Z', unreadCount: 3 },
  { id: 'CV-4', contactName: 'Laura Diaz', channel: 'phone', subject: 'Contract renewal', lastMessage: 'Discussed renewal terms', status: 'resolved', assignee: 'Maria Lopez', updatedAt: '2026-04-27T16:00:00Z', unreadCount: 0 },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-wrap: wrap;
  }
`;

const StyledChannel = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  min-width: 28px;
  text-align: center;
`;

const StyledContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledContactName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledPreview = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledUnread = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
`;

export const UnifiedInbox = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Unified Inbox`}</StyledTitle>
      <StyledList>
        {MOCK_CONVERSATIONS.map((conversation) => (
          <StyledItem key={conversation.id}>
            <StyledChannel>{CHANNEL_ICONS[conversation.channel]}</StyledChannel>
            <StyledContent>
              <StyledContactName>{conversation.contactName}</StyledContactName>
              <StyledPreview>{conversation.lastMessage}</StyledPreview>
            </StyledContent>
            {conversation.unreadCount > 0 && (
              <StyledUnread>{conversation.unreadCount}</StyledUnread>
            )}
          </StyledItem>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
