import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';

export const StyledTabBase = styled('button', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'active',
})<{ active?: boolean; disabled?: boolean; to?: string }>`
  all: unset;
  align-items: center;
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
  text-decoration: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme, active }) =>
      active ? theme.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

export const StyledTabHover = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
  &:active {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

export const StyledTabIconContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledTabMoreButton = styled(StyledTabBase)`
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;
