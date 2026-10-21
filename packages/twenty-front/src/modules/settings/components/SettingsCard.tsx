import { styled } from '@linaria/react';

import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Badge } from 'twenty-ui/primitives/data-display';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

type SettingsCardProps = {
  description?: string;
  disabled?: boolean;
  soon?: boolean;
  Icon: ReactNode;
  iconColor?: string;
  onClick?: () => void;
  to?: string;
  href?: string;
  title: string;
  className?: string;
  Status?: ReactNode;
};

const StyledCardWrapper = styled.div<{
  disabled?: boolean;
}>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'default')};
  width: 100%;
`;

const StyledCardContent = styled(Card.Content)`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.span<{ disabled?: boolean }>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.secondary};
  display: flex;
  flex: 1 0 auto;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-start;
`;

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
`;

const StyledDescription = styled.span<{ disabled?: boolean }>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: block;
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[7]};
`;

const StyledIconContainer = styled.span<{
  disabled?: boolean;
  iconColor?: string;
}>`
  align-items: center;
  color: ${({ disabled, iconColor }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : (iconColor ?? themeCssVariables.font.color.tertiary)};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

export const SettingsCard = ({
  description,
  soon,
  disabled = soon,
  Icon,
  iconColor,
  onClick,
  to,
  href,
  title,
  className,
  Status,
}: SettingsCardProps) => {
  const theme = useTheme();

  const getContentOwner = () => {
    if (disabled) {
      return undefined;
    }

    if (isDefined(to)) {
      return <Link to={to} onClick={onClick} />;
    }

    if (isDefined(href)) {
      return <a href={href} target="_blank" rel="noopener noreferrer" />;
    }

    if (isDefined(onClick)) {
      return <button type="button" onClick={onClick} />;
    }

    return undefined;
  };

  return (
    <StyledCardWrapper disabled={disabled} className={className}>
      <Card.Root fullWidth>
        <StyledCardContent render={getContentOwner()}>
          <StyledHeader>
            <StyledIconContainer disabled={disabled} iconColor={iconColor}>
              {Icon}
            </StyledIconContainer>
            <StyledTitle disabled={disabled}>
              {title}
              {soon && <Badge>{t`Soon`}</Badge>}
            </StyledTitle>
            {isDefined(Status) && Status}
            <StyledIconChevronRightContainer>
              <IconChevronRight size={theme.icon.size.sm} />
            </StyledIconChevronRightContainer>
          </StyledHeader>
          {description && (
            <StyledDescription disabled={disabled}>
              {description}
            </StyledDescription>
          )}
        </StyledCardContent>
      </Card.Root>
    </StyledCardWrapper>
  );
};
