import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared';
import { CardContent, IconComponent } from 'twenty-ui';

const StyledRow = styled(CardContent)`
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  min-height: ${({ theme }) => theme.spacing(6)};
`;

const StyledLabel = styled.span`
  flex: 1 0 auto;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.secondary};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

type SettingsListItemCardContentProps = {
  label: string;
  divider?: boolean;
  LeftIcon?: IconComponent;
  onClick?: () => void;
  rightComponent: ReactNode;
  to?: string;
};

export const SettingsListItemCardContent = ({
  label,
  divider,
  LeftIcon,
  onClick,
  rightComponent,
  to,
}: SettingsListItemCardContentProps) => {
  const theme = useTheme();

  const content = (
    <StyledRow onClick={onClick} divider={divider}>
      {!!LeftIcon && <LeftIcon size={theme.icon.size.md} />}
      <StyledLabel>{label}</StyledLabel>
      {rightComponent}
    </StyledRow>
  );

  if (isDefined(to)) {
    return <StyledLink to={to}>{content}</StyledLink>;
  }

  return content;
};
