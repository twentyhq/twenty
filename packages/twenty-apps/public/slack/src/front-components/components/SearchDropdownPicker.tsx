import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import {
  type SlackPickerOption,
  SlackPickerDropdownPanel,
} from 'src/front-components/components/SlackPickerDropdownPanel';
import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
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
  const [isFocused, setIsFocused] = useState(false);

  const hasSearchTerm = isNonEmptyString(searchTerm.trim());
  const isDropdownOpen = isFocused && hasSearchTerm;

  const handleSelect = (option: TOption) => {
    onSearchTermChange('');
    onSelect(option);
  };

  const pickerOptions = options.map(getOption);

  return (
    <StyledContainer>
      <SlackUserLinkTextInput
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(event) => {
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
      {isDropdownOpen && (
        <SlackPickerDropdownPanel
          options={pickerOptions}
          isSearching={isSearching}
          emptyText={emptyText}
          listLabel={searchLabel}
          onSelect={(optionKey) => {
            const selectedOption = options.find(
              (option) => getOption(option).key === optionKey,
            );

            if (selectedOption !== undefined) {
              handleSelect(selectedOption);
            }
          }}
        />
      )}
    </StyledContainer>
  );
};
