import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui/display';

export const StyledContainer = styled.div<{
  isNavigationDrawerExpanded: boolean;
}>`
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  height: ${({ theme }) => theme.spacing(5)};
  padding: calc(${({ theme }) => theme.spacing(1)} - 1px);
  width: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? '100%' : 'auto'};
  gap: ${({ theme, isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? theme.spacing(1) : '0'};
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

export const StyledLabel = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  align-items: center;
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
  display: flex;
`;
