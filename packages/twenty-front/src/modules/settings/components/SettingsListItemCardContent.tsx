import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight, type IconComponent } from 'twenty-ui/display';
import { CardContent } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowContainer = styled.div`
  > * {
    align-items: center;
    display: flex;
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.medium};
    gap: ${themeCssVariables.spacing[2]};
    min-height: ${themeCssVariables.spacing[6]};
    padding: ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[3]};
  }
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1 1 0;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-weight: ${themeCssVariables.font.weight.regular};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledLinkContainer = styled.div`
  > a {
    color: ${themeCssVariables.font.color.secondary};
    text-decoration: none;
  }
`;

type SettingsListItemCardContentProps = {
  label: string;
  description?: string;
  divider?: boolean;
  LeftIcon?: IconComponent;
  LeftIconColor?: string;
  onClick?: () => void;
  rightComponent: ReactNode;
  to?: string;
};

export const SettingsListItemCardContent = ({
  label,
  description,
  divider,
  LeftIcon,
  LeftIconColor,
  onClick,
  rightComponent,
  to,
}: SettingsListItemCardContentProps) => {
  const { theme } = useContext(ThemeContext);

  const content = (
    <StyledRowContainer>
      <CardContent
        onClick={onClick}
        divider={divider}
        isClickable={!!onClick || !!to}
        hasHoverHighlight={!!to}
      >
        {!!LeftIcon && (
          <LeftIcon
            size={theme.icon.size.md}
            color={LeftIconColor ?? 'currentColor'}
          />
        )}
        <StyledContent>
          <StyledLabel>{label}</StyledLabel>
          {!!description && (
            <StyledDescription>{description}</StyledDescription>
          )}
        </StyledContent>
        <StyledRightContainer>
          {rightComponent}
          {!!to && (
            <IconChevronRight
              size={theme.icon.size.md}
              color={theme.font.color.tertiary}
            />
          )}
        </StyledRightContainer>
      </CardContent>
    </StyledRowContainer>
  );

  if (isDefined(to)) {
    return (
      <StyledLinkContainer>
        <Link to={to}>{content}</Link>
      </StyledLinkContainer>
    );
  }

  return content;
};
