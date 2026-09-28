import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackDropdownBackdrop } from 'src/front-components/components/SlackDropdownBackdrop';
import { SlackDropdownTrigger } from 'src/front-components/components/SlackDropdownTrigger';
import { SlackPickerDropdownPanel } from 'src/front-components/components/SlackPickerDropdownPanel';

const StyledContainer = styled.div`
  min-width: 0;
  position: relative;
  width: 100%;
`;

const StyledValue = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SlackSelectOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type SlackSelectProps<TValue extends string> = {
  id?: string;
  value: TValue;
  options: SlackSelectOption<TValue>[];
  onChange: (value: TValue) => void;
  ariaLabel: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
};

export const SlackSelect = <TValue extends string>({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  disabled,
  size = 'medium',
}: SlackSelectProps<TValue>) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <StyledContainer>
      <SlackDropdownTrigger
        id={id}
        ariaLabel={ariaLabel}
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        disabled={disabled}
        size={size}
      >
        <StyledValue>{selectedOption?.label ?? value}</StyledValue>
      </SlackDropdownTrigger>
      {isOpen && (
        <>
          <SlackDropdownBackdrop onClose={() => setIsOpen(false)} />
          <SlackPickerDropdownPanel
            options={options.map((option) => ({
              key: option.value,
              name: option.label,
              isSelected: option.value === value,
            }))}
            isSearching={false}
            emptyText="No options"
            listLabel={ariaLabel}
            onSelect={(optionKey) => {
              setIsOpen(false);

              const nextOption = options.find(
                (option) => option.value === optionKey,
              );

              if (isDefined(nextOption)) {
                onChange(nextOption.value);
              }
            }}
          />
        </>
      )}
    </StyledContainer>
  );
};
