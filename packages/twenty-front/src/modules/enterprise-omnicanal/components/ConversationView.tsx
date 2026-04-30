import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { MessageData } from '../types/omnicanal.types';
import { GET_OMNICANAL_DATA } from '../hooks/useOmnicanal';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; max-width: 640px; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledThread = styled.div` display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const StyledBubble = styled.div<{ isOutbound: boolean }>` max-width: 80%; align-self: ${({ isOutbound }) => (isOutbound ? 'flex-end' : 'flex-start')}; padding: ${themeCssVariables.spacing[3]}; border-radius: 12px; background: ${({ isOutbound }) => isOutbound ? themeCssVariables.color.blue : themeCssVariables.background.transparent.lighter}; color: ${({ isOutbound }) => isOutbound ? themeCssVariables.font.color.inverted : themeCssVariables.font.color.primary}; @media (max-width: ${MOBILE_VIEWPORT}px) { max-width: 95%; } `;
const StyledAuthor = styled.span` font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; display: block; margin-bottom: 4px; `;
const StyledBody = styled.span` font-size: ${themeCssVariables.font.size.md}; `;
const StyledTime = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; display: block; margin-top: 4px; `;

export const ConversationView = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_OMNICANAL_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const messages: MessageData[] = data?.omnicanalData?.messages ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Conversation`}</StyledTitle>
      <StyledThread>
        {messages.map((m) => (
          <StyledBubble key={m.id} isOutbound={m.direction === 'outbound'}><StyledAuthor>{m.author}</StyledAuthor><StyledBody>{m.content}</StyledBody><StyledTime>{new Date(m.timestamp).toLocaleTimeString()}</StyledTime></StyledBubble>
        ))}
      </StyledThread>
    </StyledContainer>
  );
};
