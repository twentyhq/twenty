import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledDropdown = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-shadow: ${() => themeCssVariables.boxShadow.light};
  box-sizing: border-box;
  left: 0;
  margin-top: ${() => themeCssVariables.spacing[1]};
  max-height: 240px;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1;
`;

const StyledOption = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${() => themeCssVariables.background.secondary};
  }
`;

const StyledOptionName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledOptionMeta = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
`;

type SearchDropdownPickerProps<TOption> = {
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  options: TOption[];
  isSearching: boolean;
  onSelect: (option: TOption) => void;
  getOptionKey: (option: TOption) => string;
  getOptionName: (option: TOption) => string;
  getOptionMeta: (option: TOption) => string | undefined;
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
  getOptionKey,
  getOptionName,
  getOptionMeta,
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

  return (
    <StyledContainer>
      <SlackUserLinkTextInput
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Enter picks the top match instead of submitting the form the search
        // sits in, which would silently do nothing for a partial name.
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
        <StyledDropdown>
          {options.map((option) => {
            const meta = getOptionMeta(option);

            return (
              <StyledOption
                key={getOptionKey(option)}
                type="button"
                // Select on mousedown: the input's blur fires before a click
                // would, closing the dropdown and unmounting this option, so
                // onClick never runs in the front-component sandbox.
                // preventDefault keeps focus.
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(option);
                }}
              >
                <StyledOptionName>{getOptionName(option)}</StyledOptionName>
                {isNonEmptyString(meta) && (
                  <StyledOptionMeta>{meta}</StyledOptionMeta>
                )}
              </StyledOption>
            );
          })}
          {options.length === 0 && (
            <StyledEmptyState>
              {isSearching ? 'Searching…' : emptyText}
            </StyledEmptyState>
          )}
        </StyledDropdown>
      )}
    </StyledContainer>
  );
};
