import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { IconComponent, CardContent } from 'twenty-ui';

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

type SettingsListItemCardContentProps = {
  label: string;
  divider?: boolean;
  LeftIcon?: IconComponent;
  onClick?: () => void;
  rightComponent: ReactNode;
};

export const SettingsListItemCardContent = ({
  label,
  divider,
  LeftIcon,
  onClick,
  rightComponent,
}: SettingsListItemCardContentProps) => {
  const theme = useTheme();

  return (
    <StyledRow onClick={onClick} divider={divider}>
      {!!LeftIcon && <LeftIcon size={theme.icon.size.md} />}
      <StyledLabel>{label}</StyledLabel>
      {rightComponent}
    </StyledRow>
  );
};
