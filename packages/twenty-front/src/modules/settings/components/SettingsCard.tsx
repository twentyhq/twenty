import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronRight, Pill, Card, CardContent } from 'twenty-ui';

import { ReactNode } from 'react';

type SettingsCardProps = {
  description?: string;
  disabled?: boolean;
  soon?: boolean;
  Icon: ReactNode;
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
  width: 100%;
  & :hover {
    background-color: ${({ theme }) => theme.background.quaternary};
    cursor: pointer;
  }
`;

const StyledCardContent = styled(CardContent)<object>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2, 2)};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(7)};
`;

const StyledIconContainer = styled.div`
  align-items: center;
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
  onClick,
  title,
  className,
}: SettingsCardProps) => {
  const theme = useTheme();

  return (
    <StyledCard
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={className}
      rounded={true}
    >
      <StyledCardContent>
        <StyledHeader>
          <StyledIconContainer>{Icon}</StyledIconContainer>
          <StyledTitle disabled={disabled}>
            {title}
            {soon && <Pill label="Soon" />}
          </StyledTitle>
          <StyledIconChevronRight size={theme.icon.size.sm} />
        </StyledHeader>
        {description && <StyledDescription>{description}</StyledDescription>}
      </StyledCardContent>
    </StyledCard>
  );
};
