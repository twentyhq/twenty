import { styled } from '@linaria/react';
import { Loader } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledProgressText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

export const CommandListItemLoader = ({ progress }: { progress: number }) => {
  return (
    <StyledContainer>
      <StyledProgressText>{Math.round(progress)}%</StyledProgressText>
      <Loader />
    </StyledContainer>
  );
};
