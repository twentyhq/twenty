import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

import { ActionBarItemAccent } from '../types/ActionBarItemAccent';

type ActionBarItemProps = {
  Icon: IconComponent;
  label: string;
  accent?: ActionBarItemAccent;
  onClick: () => void;
};

const StyledButton = styled.div<{ accent: ActionBarItemAccent }>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${(props) =>
    props.accent === 'danger'
      ? props.theme.color.red
      : props.theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing(2)};
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${({ theme, accent }) =>
      accent === 'danger'
        ? theme.tag.background.red
        : theme.background.tertiary};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export const ActionBarItem = ({
  label,
  Icon,
  accent = 'standard',
  onClick,
}: ActionBarItemProps) => {
  const theme = useTheme();
  return (
    <StyledButton accent={accent} onClick={onClick}>
      {Icon && <Icon size={theme.icon.size.md} />}
      <StyledButtonLabel>{label}</StyledButtonLabel>
    </StyledButton>
  );
};
