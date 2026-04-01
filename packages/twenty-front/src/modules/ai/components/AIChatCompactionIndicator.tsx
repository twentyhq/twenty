import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconTransform } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIndicatorContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDisplayMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledIconTextContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AIChatCompactionIndicator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledIndicatorContainer>
      <StyledIconTextContainer>
        <IconTransform size={theme.icon.size.sm} />
        <StyledDisplayMessage>
          The conversation has been compacted
        </StyledDisplayMessage>
      </StyledIconTextContainer>
    </StyledIndicatorContainer>
  );
};
