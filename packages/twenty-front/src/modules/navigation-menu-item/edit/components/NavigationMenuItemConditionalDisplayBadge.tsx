import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconEyeOff } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledBadge = styled.span`
  align-items: center;
  bottom: 0;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  pointer-events: none;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: 0;
`;

export const NavigationMenuItemConditionalDisplayBadge = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledBadge
      data-navigation-conditional-display-badge
      role="img"
      aria-label={t`Custom rule`}
    >
      <IconEyeOff size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
    </StyledBadge>
  );
};
