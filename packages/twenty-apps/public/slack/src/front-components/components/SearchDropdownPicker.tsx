import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';

import { SlackDropdownBackdrop } from 'src/front-components/components/SlackDropdownBackdrop';
import {
  type SlackPickerOption,
  SlackPickerDropdownPanel,
} from 'src/front-components/components/SlackPickerDropdownPanel';
import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInputWrapper = styled.div`
  position: relative;
  z-index: 2;
`;

type SearchDropdownPickerProps<TOption> = {
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  options: TOption[];
  isSearching: boolean;
  onSelect: (option: TOption) => void;
  getOption: (option: TOption) => SlackPickerOption;
  searchLabel: string;
  emptyText: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const SearchDropdownPicker = <TOption,>({
  searchTerm,
  onSearchTermChange,
  options,
  isSearching,
  onSelect,
  getOption,
  searchLabel,
  emptyText,
  disabled,
  autoFocus,
}: SearchDropdownPickerProps<TOption>) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasSearchTerm = isNonEmptyString(searchTerm.trim());
  const isDropdownOpen = isOpen && hasSearchTerm;

  const handleSelect = (option: TOption) => {
    setIsOpen(false);
    onSearchTermChange('');
    onSelect(option);
  };

  return (
    <StyledContainer>
      <StyledInputWrapper>
        <SlackUserLinkTextInput
          value={searchTerm}
          onChange={(event) => {
            setIsOpen(true);
            onSearchTermChange(event.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setIsOpen(false);

              return;
            }

            if (event.key !== 'Enter') {
              return;
            }

            event.preventDefault();

            if (options.length > 0) {
              handleSelect(options[0]);
            }
          }}
          placeholder={searchLabel}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={searchLabel}
        />
      </StyledInputWrapper>
      {isDropdownOpen && (
        <>
          <SlackDropdownBackdrop onClose={() => setIsOpen(false)} />
          <SlackPickerDropdownPanel
            options={options.map(getOption)}
            isSearching={isSearching}
            emptyText={emptyText}
            listLabel={searchLabel}
            onSelect={(optionKey) => {
              const selectedOption = options.find(
                (option) => getOption(option).key === optionKey,
              );

              if (isDefined(selectedOption)) {
                handleSelect(selectedOption);
              }
            }}
          />
        </>
      )}
    </StyledContainer>
  );
};
