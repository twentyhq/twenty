import { styled } from '@linaria/react';
import { IconTransform } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledIndicatorContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledIconTextContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AiChatCompactionIndicator = () => {
  const theme = useTheme();

  return (
    <StyledIndicatorContainer>
      <StyledIconTextContainer>
        <IconTransform size={theme.icon.size.sm} />
        <div>The conversation has been compacted</div>
      </StyledIconTextContainer>
    </StyledIndicatorContainer>
  );
};
