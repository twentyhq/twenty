import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: inline-flex;

  background: ${themeCssVariables.background.transparent.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]};
  gap: ${themeCssVariables.spacing[1]};

  border-radius: 4px;
`;

export const ForbiddenFieldDisplay = () => {
  return (
    <StyledContainer>
      <IconLock
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.sm)}
      />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
