import styled from '@emotion/styled';
import { Command } from 'cmdk';

export const StyledDialog = styled(Command.Dialog)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 640px;
  padding: 25px;
  width: 100%;
  background: ${(props) => props.theme.primaryBackground};
  border-radius: ${(props) => props.theme.borderRadius};
  overflow: hidden;
  padding: 0;
  font-family: ${(props) => props.theme.fontFamily};
  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);
`;

export const StyledInput = styled(Command.Input)`
  border: none;
  width: 100%;
  font-size: ${(props) => props.theme.fontSizeLarge};
  padding: ${(props) => props.theme.spacing(5)};
  outline: none;
  background: ${(props) => props.theme.primaryBackground};
  color: ${(props) => props.theme.text100};
  border-bottom: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 0;
  caret-color: ${(props) => props.theme.blue};
  margin: 0;
`;

export const StyledItem = styled(Command.Item)`
  cursor: pointer;
  height: 48px;
  font-size: ${(props) => props.theme.fontSizeMedium};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(3)};
  padding: 0 ${(props) => props.theme.spacing(4)};
  color: ${(props) => props.theme.text100};
  user-select: none;
  transition: all 150ms ease;
  transition-property: none;
  position: relative;
  &:hover {
    background: ${(props) => props.theme.clickableElementBackgroundHover};
  }
  &[data-selected='true'] {
    background: ${(props) => props.theme.secondaryBackground};
    &:after {
      content: '';
      position: absolute;
      left: 0;
      z-index: 123;
      width: 3px;
      height: 100%;
      background: ${(props) => props.theme.blue};
    }
  }
  &[data-disabled='true'] {
    color: ${(props) => props.theme.text30};
    cursor: not-allowed;
  }
  svg {
    width: 16px;
    height: 16px;
    color: ${(props) => props.theme.text80};
  }
`;

export const StyledList = styled(Command.List)`
  height: min(300px, var(--cmdk-list-height));
  max-height: 400px;
  overflow: auto;
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
  background: ${(props) => props.theme.secondaryBackground};
`;

export const StyledGroup = styled(Command.Group)`
  [cmdk-group-heading] {
    user-select: none;
    font-size: ${(props) => props.theme.fontSizeExtraSmall};
    color: ${(props) => props.theme.text30};
    padding: ${(props) => props.theme.spacing(2)};
    display: flex;
    align-items: center;
  }
`;

export const StyledEmpty = styled(Command.Empty)`
  font-size: ${(props) => props.theme.fontSizeMedium};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  white-space: pre-wrap;
  color: ${(props) => props.theme.text30};
`;

export const StyledSeparator = styled(Command.Separator)``;
