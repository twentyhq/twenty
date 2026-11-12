import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { StyledAiChatAskStatusMessage } from '@/ai/components/StyledAiChatAskStatusMessage';
import { ShimmeringText } from '@/ai/components/ShimmeringText';

const StyledContainer = styled.div`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  line-height: ${themeCssVariables.spacing[6]};
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
      <StyledIconContainer>
        <Icon size={theme.icon.size.sm} />
      </StyledIconContainer>
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
