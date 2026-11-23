import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { TeamsUserLinkTextInput } from 'src/features/chat/front-components/TeamsUserLinkTextInput';

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

const StyledOption = styled.button<{ $isHighlighted: boolean }>`
  background: ${({ $isHighlighted }) =>
    $isHighlighted
      ? themeCssVariables.background.secondary
      : themeCssVariables.background.primary};
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
  const { t } = useTranslate();
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const hasSearchTerm = isNonEmptyString(searchTerm.trim());
  const isDropdownOpen = isFocused && hasSearchTerm;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, options.length]);

  const handleSelect = (option: TOption) => {
    onSearchTermChange('');
    onSelect(option);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % options.length);

      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex(
        (index) => (index - 1 + options.length) % options.length,
      );

      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const highlightedOption = options[highlightedIndex];

      if (isDefined(highlightedOption)) {
        handleSelect(highlightedOption);
      }
    }
  };

  return (
    <StyledContainer>
      <TeamsUserLinkTextInput
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={searchLabel}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={searchLabel}
      />
      {isDropdownOpen && (
        <StyledDropdown onMouseDown={(event) => event.preventDefault()}>
          {options.map((option, index) => {
            const meta = getOptionMeta(option);

            return (
              <StyledOption
                key={getOptionKey(option)}
                type="button"
                $isHighlighted={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(option)}
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
              {isSearching ? t('Searching…') : emptyText}
            </StyledEmptyState>
          )}
        </StyledDropdown>
      )}
    </StyledContainer>
  );
};
