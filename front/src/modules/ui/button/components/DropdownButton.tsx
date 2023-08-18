import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { IconChevronDown } from '@/ui/icon/index';

type ButtonProps = React.ComponentProps<'button'>;

export type DropdownOptionType = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

type OwnProps = {
  options: DropdownOptionType[];
  selectedOptionKey?: string;
  onSelection: (value: DropdownOptionType) => void;
} & ButtonProps;

const StyledButton = styled.button<ButtonProps & { isOpen: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-left-radius: ${({ isOpen, theme }) =>
    isOpen ? 0 : theme.border.radius.sm};
  border-bottom-right-radius: ${({ isOpen, theme }) =>
    isOpen ? 0 : theme.border.radius.sm};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  svg {
    align-items: center;
    display: flex;
    height: 14px;
    justify-content: center;
    width: 14px;
  }
`;

const StyledDropdownItem = styled.button<ButtonProps>`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  svg {
    align-items: center;
    display: flex;
    height: 14px;
    justify-content: center;
    width: 14px;
  }
`;

const StyledDropdownContainer = styled.div`
  position: relative;
`;

const StyledDropdownMenu = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
`;

export function DropdownButton({
  options,
  selectedOptionKey,
  onSelection,
  ...buttonProps
}: OwnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    DropdownOptionType | undefined
  >(undefined);

  useEffect(() => {
    if (selectedOptionKey) {
      const option = options.find((option) => option.key === selectedOptionKey);
      setSelectedOption(option);
    } else {
      setSelectedOption(options[0]);
    }
  }, [selectedOptionKey, options]);

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
    <>
      {selectedOption && (
        <StyledDropdownContainer>
          <StyledButton
            onClick={() => setIsOpen(!isOpen)}
            {...buttonProps}
            isOpen={isOpen}
          >
            {selectedOption.icon}
            {selectedOption.label}
            {options.length > 1 && <IconChevronDown />}
          </StyledButton>
          {isOpen && (
            <StyledDropdownMenu>
              {options
                .filter((option) => option.label !== selectedOption.label)
                .map((option, index) => (
                  <StyledDropdownItem
                    key={index}
                    onClick={handleSelect(option)}
                  >
                    {option.icon}
                    {option.label}
                  </StyledDropdownItem>
                ))}
            </StyledDropdownMenu>
          )}
        </StyledDropdownContainer>
      )}
    </>
  );
}
