import styled from '@emotion/styled';
import { Command } from 'cmdk';

export const StyledDialog = styled(Command.Dialog)`
  background: ${(props) => props.theme.primaryBackground};
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: ${(props) => props.theme.modalBoxShadow};
  font-family: ${(props) => props.theme.fontFamily};
  left: 50%;
  max-width: 640px;
  overflow: hidden;
  padding: 0;
  padding: 25px;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
`;

export const StyledInput = styled(Command.Input)`
  background: ${(props) => props.theme.primaryBackground};
  border: none;
  border-bottom: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 0;
  caret-color: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.text100};
  font-size: ${(props) => props.theme.fontSizeLarge};
  margin: 0;
  outline: none;
  padding: ${(props) => props.theme.spacing(5)};
  width: 100%;
`;

export const StyledItem = styled(Command.Item)`
  align-items: center;
  color: ${(props) => props.theme.text100};
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.theme.fontSizeMedium};
  gap: ${(props) => props.theme.spacing(3)};
  height: 48px;
  padding: 0 ${(props) => props.theme.spacing(4)};
  position: relative;
  transition: all 150ms ease;
  transition-property: none;
  user-select: none;
  &:hover {
    background: ${(props) => props.theme.lightBackgroundTransparent};
  }
  &[data-selected='true'] {
    background: ${(props) => props.theme.secondaryBackground};
    &:after {
      background: ${(props) => props.theme.blue};
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      width: 3px;
      z-index: ${(props) => props.theme.lastLayerZIndex};
    }
  }
  &[data-disabled='true'] {
    color: ${(props) => props.theme.text30};
    cursor: not-allowed;
  }
  svg {
    color: ${(props) => props.theme.text80};
    height: 16px;
    width: 16px;
  }
`;

export const StyledList = styled(Command.List)`
  background: ${(props) => props.theme.secondaryBackground};
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
    color: ${(props) => props.theme.text30};
    display: flex;
    font-size: ${(props) => props.theme.fontSizeExtraSmall};
    padding: ${(props) => props.theme.spacing(2)};
    user-select: none;
  }
`;

export const StyledEmpty = styled(Command.Empty)`
  align-items: center;
  color: ${(props) => props.theme.text30};
  display: flex;
  font-size: ${(props) => props.theme.fontSizeMedium};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;

export const StyledSeparator = styled(Command.Separator)``;
