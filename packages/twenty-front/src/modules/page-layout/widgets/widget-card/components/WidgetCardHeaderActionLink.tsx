import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledActionLink = styled(Link)`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  min-width: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[1]};
  text-decoration: none;
  transition: background calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;
  width: ${themeCssVariables.spacing[6]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
  }

  &:active {
    background: ${themeCssVariables.background.transparent.medium};
  }
`;

type WidgetCardHeaderActionLinkProps = {
  Icon: IconComponent;
  label: string;
  to: string;
};

export const WidgetCardHeaderActionLink = ({
  Icon,
  label,
  to,
}: WidgetCardHeaderActionLinkProps) => {
  const theme = useTheme();

  return (
    <StyledActionLink to={to} aria-label={label} title={label}>
      <Icon size={theme.icon.size.sm} aria-hidden />
    </StyledActionLink>
  );
};
