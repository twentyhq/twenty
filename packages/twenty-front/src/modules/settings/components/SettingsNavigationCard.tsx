import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronRight, Pill } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsNavigationCardProps = {
  children: ReactNode;
  disabled?: boolean;
  soon?: boolean;
  Icon: IconComponent;
  onClick?: () => void;
  title: string;
  className?: string;
};

const StyledCard = styled(Card)<{
  disabled?: boolean;
  onClick?: () => void;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
  cursor: ${({ disabled, onClick }) =>
    disabled ? 'not-allowed' : onClick ? 'pointer' : 'default'};
`;

const StyledCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4, 3)};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitle = styled.div<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? 'inherit' : theme.font.color.secondary};
  display: flex;
  flex: 1 0 auto;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDescription = styled.div`
  padding-left: ${({ theme }) => theme.spacing(8)};
`;

export const SettingsNavigationCard = ({
  children,
  soon,
  disabled = soon,
  Icon,
  onClick,
  title,
  className,
}: SettingsNavigationCardProps) => {
  const theme = useTheme();

  return (
    <StyledCard
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={className}
    >
      <StyledCardContent>
        <StyledHeader>
          <Icon size={theme.icon.size.lg} stroke={theme.icon.stroke.sm} />
          <StyledTitle disabled={disabled}>
            {title}
            {soon && <Pill label="Soon" />}
          </StyledTitle>
          <StyledIconChevronRight size={theme.icon.size.sm} />
        </StyledHeader>
        <StyledDescription>{children}</StyledDescription>
      </StyledCardContent>
    </StyledCard>
  );
};
