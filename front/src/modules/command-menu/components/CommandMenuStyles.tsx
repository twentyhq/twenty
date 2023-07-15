import styled from '@emotion/styled';
import { Command } from 'cmdk';

export const StyledDialog = styled(Command.Dialog)`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  left: 50%;
  max-width: 640px;
  overflow: hidden;
  padding: 0;
  padding: ${({ theme }) => theme.spacing(1)};
  position: fixed;
  top: 30%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 1000;
`;

export const StyledInput = styled(Command.Input)`
  background: ${({ theme }) => theme.background.primary};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(5)};
  width: 100%;
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const StyledMenuItem = styled(Command.Item)`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(3)};
  height: 40px;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  position: relative;
  transition: all 150ms ease;
  transition-property: none;
  user-select: none;
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  &[data-selected='true'] {
    background: ${({ theme }) => theme.background.tertiary};
    /* Could be nice to add a caret like this for better accessibility in the future
    But it needs to be consistend with other picker dropdown (e.g. company)
    &:after {
      background: ${({ theme }) => theme.background.quaternary};
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      width: 3px;
      z-index: ${({ theme }) => theme.lastLayerZIndex};
    } */
  }
  &[data-disabled='true'] {
    color: ${({ theme }) => theme.font.color.light};
    cursor: not-allowed;
  }
  svg {
    height: 16px;
    width: 16px;
  }
`;

export const StyledList = styled(Command.List)`
  background: ${({ theme }) => theme.background.secondary};
  height: min(300px, var(--cmdk-list-height));
  max-height: 400px;
  overflow: auto;
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

export const StyledGroup = styled(Command.Group)`
  [cmdk-group-heading] {
    align-items: center;
    color: ${({ theme }) => theme.font.color.light};
    display: flex;
    font-size: ${({ theme }) => theme.font.size.xs};
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    padding-bottom: ${({ theme }) => theme.spacing(2)};
    padding-left: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(1)};
    padding-top: ${({ theme }) => theme.spacing(2)};
    text-transform: uppercase;
    user-select: none;
  }
`;

export const StyledEmpty = styled(Command.Empty)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;

export const StyledSeparator = styled(Command.Separator)``;

export const StyledIconAndLabelContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;
export const StyledIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;
export const StyledShortCut = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const StyledShortcutsContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
`;
