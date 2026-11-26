import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledAiChatAskCard = styled.div<{
  isPadded?: boolean;
  isDocked?: boolean;
}>`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom-width: ${({ isDocked }) => (isDocked ? '0' : '1px')};
  border-radius: ${({ isDocked }) =>
    isDocked
      ? `${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0 0`
      : themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ isPadded }) => (isPadded ? themeCssVariables.spacing[2] : '0')};
  padding: ${({ isPadded }) => (isPadded ? themeCssVariables.spacing[2] : '0')};
  width: 100%;
`;
