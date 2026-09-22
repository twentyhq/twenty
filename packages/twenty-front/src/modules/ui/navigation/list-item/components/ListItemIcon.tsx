import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.span`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: inline-flex;
  padding: ${themeCssVariables.spacing[1]};

  &[data-background] {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

type ListItemIconProps = {
  icon?: IconComponent | null;
  container?: 'none' | 'plain' | 'soft';
};

export const ListItemIcon = ({
  icon: Icon,
  container = 'none',
}: ListItemIconProps) => {
  const theme = useTheme();
  if (!isDefined(Icon)) {
    return null;
  }

  const icon = <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;

  if (container === 'none') {
    return icon;
  }

  return (
    <StyledContainer data-background={container === 'soft' || undefined}>
      {icon}
    </StyledContainer>
  );
};
