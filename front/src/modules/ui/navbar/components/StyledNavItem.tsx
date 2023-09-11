import styled from '@emotion/styled';

import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';

type StyledItemProps = {
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
};

export const StyledItem = styled.button<StyledItemProps>`
  align-items: center;
  background: ${({ active, theme }) =>
    active ? theme.background.transparent.light : 'inherit'};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ active, theme, danger, soon }) => {
    if (active) {
      return theme.font.color.primary;
    }
    if (danger) {
      return theme.color.red;
    }
    if (soon) {
      return theme.font.color.light;
    }
    return theme.font.color.secondary;
  }};
  cursor: ${({ soon }) => (soon ? 'default' : 'pointer')};
  display: flex;
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.md};
  margin-bottom: calc(${({ theme }) => theme.spacing(1)} / 2);
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  pointer-events: ${({ soon }) => (soon ? 'none' : 'auto')};
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
    color: ${({ danger, theme }) =>
      danger ? theme.color.red : theme.font.color.primary};
  }
  user-select: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    font-size: ${({ theme }) => theme.font.size.lg};
  }
`;

export const StyledItemLabel = styled.div`
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export const StyledItemCount = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.spacing(12)};
  color: ${({ theme }) => theme.grayScale.gray0};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  margin-left: auto;
  width: ${({ theme }) => theme.spacing(4)};
`;
