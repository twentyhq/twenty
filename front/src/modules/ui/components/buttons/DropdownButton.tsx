import React, { useState } from 'react';
import styled from '@emotion/styled';

import { IconChevronDown } from '@/ui/icons/index';

type ButtonProps = React.ComponentProps<'button'>;

export type DropdownOptionType = {
  label: string;
  icon: React.ReactNode;
};

type Props = {
  options: DropdownOptionType[];
  onSelection: (value: DropdownOptionType) => void;
} & ButtonProps;

const StyledButton = styled.button<ButtonProps>`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: 8px;
  height: 24px;
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  padding: 3px 8px;

  svg {
    align-items: center;
    display: flex;
    height: 14px;
    justify-content: center;
    width: 14px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2px;
  position: absolute;
`;

export function DropdownButton({
  options,
  onSelection,
  ...buttonProps
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  if (!options.length) {
    throw new Error('You must provide at least one option.');
  }

  const handleSelect =
    (option: DropdownOptionType) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onSelection(option);
      setSelectedOption(option);
      setIsOpen(false);
    };

  return (
    <DropdownContainer>
      <StyledButton onClick={() => setIsOpen(!isOpen)} {...buttonProps}>
        {selectedOption.icon}
        {selectedOption.label}
        {options.length > 1 && <IconChevronDown />}
      </StyledButton>
      {isOpen && (
        <DropdownMenu>
          {options
            .filter((option) => option.label !== selectedOption.label)
            .map((option, index) => (
              <StyledButton key={index} onClick={handleSelect(option)}>
                {option.icon}
                {option.label}
              </StyledButton>
            ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
}
