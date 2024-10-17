import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import { CardContent } from '@/ui/layout/card/components/CardContent';
import { IconComponent } from 'twenty-ui';
import { ReactNode } from 'react';

type SettingsOptionCardContentProps = {
  Icon?: IconComponent;
  title: string;
  description: string;
  onClick: () => void;
  children: ReactNode;
  divider?: boolean;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledIcon = styled.div`
  align-items: center;
  border: 2px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(8)};
  min-width: ${({ theme }) => theme.icon.size.md};
`;

export const SettingsOptionCardContent = ({
  Icon,
  title,
  description,
  onClick,
  children,
  divider,
}: SettingsOptionCardContentProps) => {
  const theme = useTheme();

  return (
    <StyledCardContent onClick={onClick} divider={divider}>
      {Icon && (
        <StyledIcon>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
        </StyledIcon>
      )}
      <div>
        <StyledTitle>{title}</StyledTitle>
        <StyledDescription>{description}</StyledDescription>
      </div>
      {children}
    </StyledCardContent>
  );
};
