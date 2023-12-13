import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronRight } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { SoonPill } from '@/ui/display/pill/components/SoonPill';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsNavigationCardProps = {
  children: ReactNode;
  disabled?: boolean;
  hasSoonPill?: boolean;
  Icon: IconComponent;
  onClick?: () => void;
  title: string;
};

const StyledCard = styled(Card)<{
  disabled?: boolean;
  onClick?: () => void;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
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

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
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
  disabled,
  hasSoonPill,
  Icon,
  onClick,
  title,
}: SettingsNavigationCardProps) => {
  const theme = useTheme();

  return (
    <StyledCard disabled={disabled} onClick={onClick}>
      <StyledCardContent>
        <StyledHeader>
          <Icon size={theme.icon.size.lg} stroke={theme.icon.stroke.sm} />
          <StyledTitle>
            {title}
            {hasSoonPill && <SoonPill />}
          </StyledTitle>
          <StyledIconChevronRight size={theme.icon.size.sm} />
        </StyledHeader>
        <StyledDescription>{children}</StyledDescription>
      </StyledCardContent>
    </StyledCard>
  );
};
