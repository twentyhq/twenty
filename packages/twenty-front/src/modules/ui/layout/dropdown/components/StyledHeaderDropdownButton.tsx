import styled from '@emotion/styled';

type StyledDropdownButtonProps = {
  isUnfolded?: boolean;
  isActive?: boolean;
};

export const StyledHeaderDropdownButton = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme, color }) =>
    color ?? (isActive ? theme.color.blue : theme.font.color.secondary)};
  cursor: pointer;
  display: flex;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  &:hover {
    filter: brightness(0.95);
  }
`;
