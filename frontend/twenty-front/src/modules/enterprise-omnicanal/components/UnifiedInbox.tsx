import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { ChannelType, ConversationData } from '../types/omnicanal.types';
import { GET_OMNICANAL_DATA } from '../hooks/useOmnicanal';

const CHANNEL_ICONS: Record<ChannelType, string> = { email: '\u2709', sms: '\uD83D\uDCF1', whatsapp: '\uD83D\uDCAC', chat: '\uD83D\uDDE8', social: '\uD83C\uDF10', phone: '\u260E' };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledList = styled.div` display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[1]}; `;
const StyledItem = styled.div` display: flex; align-items: center; gap: ${themeCssVariables.spacing[2]}; padding: ${themeCssVariables.spacing[2]}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-wrap: wrap; } `;
const StyledChannel = styled.span` font-size: ${themeCssVariables.font.size.lg}; min-width: 28px; text-align: center; `;
const StyledContent = styled.div` flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; `;
const StyledContactName = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledPreview = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const StyledUnread = styled.span` padding: 2px 8px; border-radius: 12px; font-size: ${themeCssVariables.font.size.xs}; background: ${themeCssVariables.color.blue}; color: ${themeCssVariables.font.color.inverted}; `;

export const UnifiedInbox = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_OMNICANAL_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const conversations: ConversationData[] = data?.omnicanalData?.conversations ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Unified Inbox`}</StyledTitle>
      <StyledList>
        {conversations.map((c) => (
          <StyledItem key={c.id}>
            <StyledChannel>{CHANNEL_ICONS[c.channel] ?? c.channel}</StyledChannel>
            <StyledContent><StyledContactName>{c.contactName}</StyledContactName><StyledPreview>{c.lastMessage}</StyledPreview></StyledContent>
            {c.unreadCount > 0 && <StyledUnread>{c.unreadCount}</StyledUnread>}
          </StyledItem>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
