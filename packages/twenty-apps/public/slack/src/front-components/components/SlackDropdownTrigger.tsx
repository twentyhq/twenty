import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTrigger = styled.button<{ $size: 'small' | 'medium' }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: grid;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  gap: ${() => themeCssVariables.spacing[1]};
  grid-template-columns: 1fr auto;
  height: ${({ $size }) =>
    $size === 'small'
      ? themeCssVariables.spacing[6]
      : themeCssVariables.spacing[8]};
  padding: 0 ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover:enabled {
    background-color: ${() => themeCssVariables.background.transparent.light};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const StyledChevron = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.font.color.tertiary};
  border-right: 1px solid ${() => themeCssVariables.font.color.tertiary};
  height: 5px;
  margin-top: -3px;
  transform: rotate(45deg);
  width: 5px;
`;

type SlackDropdownTriggerProps = {
  id?: string;
  children: ReactNode;
  ariaLabel: string;
  isOpen: boolean;
  onOpen: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
};

export const SlackDropdownTrigger = ({
  id,
  children,
  ariaLabel,
  isOpen,
  onOpen,
  disabled,
  size = 'medium',
}: SlackDropdownTriggerProps) => (
  <StyledTrigger
    id={id}
    $size={size}
    type="button"
    disabled={disabled}
    onClick={onOpen}
    aria-label={ariaLabel}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    {children}
    <StyledChevron />
  </StyledTrigger>
);
