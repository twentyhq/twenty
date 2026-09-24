import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};

  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[5]};
  line-height: ${themeCssVariables.text.lineHeight.md};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  user-select: none;
  white-space: nowrap;
`;

export const ForbiddenFieldDisplay = () => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.sm} />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
