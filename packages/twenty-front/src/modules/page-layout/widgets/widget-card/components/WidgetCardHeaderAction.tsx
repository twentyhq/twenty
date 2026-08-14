import { type WidgetHeaderAction } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledActionLink = styled(Link)`
  align-items: center;
  background: transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  min-width: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[1]};
  text-decoration: none;
  transition: background 0.1s ease;
  width: ${themeCssVariables.spacing[6]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:active {
    background: ${themeCssVariables.background.transparent.medium};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 2px;
  }
`;

type WidgetCardHeaderActionProps = {
  headerAction: WidgetHeaderAction;
};

export const WidgetCardHeaderAction = ({
  headerAction,
}: WidgetCardHeaderActionProps) => {
  const { theme } = useContext(ThemeContext);

  if (isDefined(headerAction.to) && !headerAction.disabled) {
    const Icon = headerAction.Icon;

    return (
      <StyledActionLink
        aria-label={headerAction.label}
        title={headerAction.label}
        to={headerAction.to}
      >
        <Icon size={theme.icon.size.sm} aria-hidden />
      </StyledActionLink>
    );
  }

  return (
    <LightIconButton
      Icon={headerAction.Icon}
      aria-label={headerAction.label}
      title={headerAction.label}
      accent="tertiary"
      size="small"
      onClick={headerAction.onClick}
      disabled={headerAction.disabled}
    />
  );
};
