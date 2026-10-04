import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { StyledAiChatAskStatusMessage } from '@/ai/components/AiChatAskStyledComponents';
import { ShimmeringText } from '@/ai/components/ShimmeringText';

const StyledContainer = styled.div`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 0;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

type AiChatAskStatusRowProps = {
  Icon: IconComponent;
  message: ReactNode;
  isShimmering: boolean;
  children?: ReactNode;
};

export const AiChatAskStatusRow = ({
  Icon,
  message,
  isShimmering,
  children,
}: AiChatAskStatusRowProps) => {
  const theme = useTheme();

  const messageElement = (
    <StyledAiChatAskStatusMessage>{message}</StyledAiChatAskStatusMessage>
  );

  return (
    <StyledContainer>
      <Icon size={theme.icon.size.sm} />
      <StyledContent>
        {isShimmering ? (
          <ShimmeringText>{messageElement}</ShimmeringText>
        ) : (
          messageElement
        )}
        {children}
      </StyledContent>
    </StyledContainer>
  );
};
