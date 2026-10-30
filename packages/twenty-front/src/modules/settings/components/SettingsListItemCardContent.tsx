import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight, type IconComponent } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const ROW_CONTENT_CLASS_NAME = css`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[10]};
  padding: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  pointer-events: none;

  :is(
    a,
    button,
    input,
    select,
    textarea,
    [role='button'],
    [role='checkbox'],
    [role='link'],
    [role='switch']
  ) {
    pointer-events: auto;
  }
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledLabel = styled.span`
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Rows are fixed-height, so the description truncates first rather than wrapping or squeezing the label
const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex: 1 1 0;
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  min-width: 0;
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const theme = useTheme();
  const labelId = useId();
  const descriptionId = useId();
  const hasDescription = isNonEmptyString(description);

  return (
    <Card.Content divider={divider} className={ROW_CONTENT_CLASS_NAME}>
      {isDefined(to) ? (
        <Card.Action
          render={<Link to={to} />}
          aria-labelledby={labelId}
          aria-describedby={hasDescription ? descriptionId : undefined}
          onClick={onClick}
        />
      ) : (
        isDefined(onClick) && (
          <Card.Action
            aria-labelledby={labelId}
            aria-describedby={hasDescription ? descriptionId : undefined}
            onClick={onClick}
          />
        )
      )}
      {isDefined(LeftIcon) && (
        <LeftIcon
          size={theme.icon.size.md}
          color={LeftIconColor ?? 'currentColor'}
        />
      )}
      <StyledContent>
        <StyledLabel id={labelId}>{label}</StyledLabel>
        {hasDescription && (
          <StyledDescription id={descriptionId}>
            {description}
          </StyledDescription>
        )}
      </StyledContent>
      <Card.Control render={<StyledRightContainer />}>
        {rightComponent}
        {isDefined(to) && (
          <IconChevronRight
            size={theme.icon.size.md}
            color={theme.font.color.tertiary}
          />
        )}
      </Card.Control>
    </Card.Content>
  );
};
