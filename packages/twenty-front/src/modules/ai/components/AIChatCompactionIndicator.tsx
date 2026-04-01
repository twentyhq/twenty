import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconTransform } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const AIChatCompactionIndicator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <IconTransform
        size={theme.icon.size.sm}
        color={theme.font.color.tertiary}
      />
      <StyledMessage>The conversation has been compacted</StyledMessage>
    </StyledContainer>
  );
};
