import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Loader } from 'twenty-ui/primitives/feedback';
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
      <StyledProgressText>
        {progress > 0 ? `${Math.round(progress)}%` : t`Preparing…`}
      </StyledProgressText>
      <Loader />
    </StyledContainer>
  );
};
