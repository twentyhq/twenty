import { styled } from '@linaria/react';
import { ThinkingOrbitLoaderIcon } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLoaderContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  min-height: ${themeCssVariables.spacing[6]};
  width: fit-content;
`;

export const AiChatStreamingIndicator = () => {
  return (
    <StyledLoaderContainer>
      <ThinkingOrbitLoaderIcon />
    </StyledLoaderContainer>
  );
};
