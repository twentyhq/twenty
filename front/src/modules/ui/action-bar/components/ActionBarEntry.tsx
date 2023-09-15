import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

type OwnProps = {
  Icon: IconComponent;
  label: string;
  type?: 'standard' | 'danger';
  onClick: () => void;
};

type StyledButtonProps = {
  type: 'standard' | 'danger';
};

const StyledButton = styled.div<StyledButtonProps>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${(props) =>
    props.type === 'danger'
      ? props.theme.color.red
      : props.theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing(2)};
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${({ theme, type }) =>
      type === 'danger' ? theme.tag.background.red : theme.background.tertiary};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export const ActionBarEntry = ({
  label,
  Icon,
  type = 'standard',
  onClick,
}: OwnProps) => {
  const theme = useTheme();
  return (
    <StyledButton type={type} onClick={onClick}>
      {Icon && <Icon size={theme.icon.size.md} />}
      <StyledButtonLabel>{label}</StyledButtonLabel>
    </StyledButton>
  );
};
