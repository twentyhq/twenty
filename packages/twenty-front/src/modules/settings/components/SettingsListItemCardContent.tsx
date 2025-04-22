import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { CardContent } from 'twenty-ui/layout';
import { IconChevronRight, IconComponent } from 'twenty-ui/display';

const StyledRow = styled(CardContent)<{ to?: boolean }>`
  align-items: center;
  cursor: ${({ onClick, to }) => (onClick || to ? 'pointer' : 'default')};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  min-height: ${({ theme }) => theme.spacing(6)};

  &:hover {
    ${({ to, theme }) =>
      to && `background: ${theme.background.transparent.light};`}
  }
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledContent = styled.div`
  flex: 1 0 auto;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.secondary};
  text-decoration: none;
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

  const content = (
    <StyledRow onClick={onClick} divider={divider} to={!!to}>
      {!!LeftIcon && (
        <LeftIcon
          size={theme.icon.size.md}
          color={LeftIconColor ?? 'currentColor'}
        />
      )}
      <StyledContent>
        {label}
        {!!description && <StyledDescription>{description}</StyledDescription>}
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
    </StyledRow>
  );

  if (isDefined(to)) {
    return <StyledLink to={to}>{content}</StyledLink>;
  }

  return content;
};
