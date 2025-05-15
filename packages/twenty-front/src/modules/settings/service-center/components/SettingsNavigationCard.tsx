import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Pill } from 'twenty-ui/components';
import { IconChevronRight, IconComponent } from 'twenty-ui/display';
import { Card, CardContent } from 'twenty-ui/layout';

type SettingsNavigationCardProps = {
  children: ReactNode;
  disabled?: boolean;
  soon?: boolean;
  Icon: IconComponent;
  onClick?: () => void;
  title: string;
  className?: string;
};

const StyledCard = styled(Card)`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
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
  title,
  className,
}: SettingsNavigationCardProps) => {
  const theme = useTheme();

  return (
    <StyledCard className={className}>
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
