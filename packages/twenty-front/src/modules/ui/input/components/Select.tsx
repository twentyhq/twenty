import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type SelectProps } from '@/ui/input/types/SelectProps';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useRef, useState } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { Tag } from 'twenty-ui/primitives/data-display';

import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const Select = <TValue extends SelectValue>({
  className,
  disabled: disabledFromProps,
  selectSizeVariant,
  dropdownId,
  dropdownWidth = GenericDropdownContentWidth.Medium,
  dropdownWidthAuto = false,
  emptyOption,
  fullWidth,
  label,
  description,
  onChange,
  onBlur,
  options,
  value,
  withSearchInput,
  needIconCheck,
  pinnedOption,
  callToActionButton,
  dropdownOffset,
  hasRightElement,
  showContextualTextInControl = true,
  showIconInControl = true,
  variant = 'default',
  renderAsTag = false,
}: SelectProps<TValue>) => {
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const [searchInputValue, setSearchInputValue] = useState('');

  const selectedOption = useMemo(() => {
    if (isDefined(pinnedOption) && pinnedOption.value === value) {
      return pinnedOption;
    }

    const fromMatchingOption = options.find(
      ({ value: optionValue }) => optionValue === value,
    );

    if (isDefined(fromMatchingOption)) {
      return fromMatchingOption;
    }

    if (isDefined(emptyOption)) {
      return emptyOption;
    }

    if (isNonEmptyArray(options)) {
      return options[0];
    }

    return null;
  }, [emptyOption, options, pinnedOption, value]);

  const filteredOptions = useMemo(() => {
    if (!isNonEmptyString(searchInputValue)) {
      return options;
    }

    const normalizedSearch = normalizeSearchText(searchInputValue);

    return options.filter(
      ({ label, searchKeywords }) =>
        normalizeSearchText(label).includes(normalizedSearch) ||
        (isDefined(searchKeywords) &&
          normalizeSearchText(searchKeywords).includes(normalizedSearch)),
    );
  }, [options, searchInputValue]);

  const isDisabled =
    disabledFromProps ||
    (options.length <= 1 &&
      !isDefined(pinnedOption) &&
      !isDefined(callToActionButton) &&
      (!isDefined(emptyOption) || selectedOption !== emptyOption));

  const dropDownMenuWidth =
    dropdownWidthAuto && selectContainerRef.current?.clientWidth
      ? selectContainerRef.current?.clientWidth
      : dropdownWidth;

  const controlSelectedOption = useMemo(() => {
    if (!isDefined(selectedOption)) {
      return selectedOption;
    }

    return {
      ...selectedOption,
      contextualText: showContextualTextInControl
        ? selectedOption.contextualText
        : undefined,
      Icon: showIconInControl ? selectedOption.Icon : undefined,
    };
  }, [selectedOption, showContextualTextInControl, showIconInControl]);

  if (!isDefined(controlSelectedOption)) {
    return <></>;
  }

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth}
      tabIndex={0}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        const isFocusWithinSelect =
          nextFocus instanceof Node &&
          (event.currentTarget.contains(nextFocus) ||
            dropdownContentRef.current?.contains(nextFocus));

        if (isFocusWithinSelect) {
          return;
        }

        onBlur?.();
      }}
      ref={selectContainerRef}
    >
      {isNonEmptyString(label) && <StyledLabel>{label}</StyledLabel>}
      {isDisabled ? (
        <SelectControl
          renderAsTag={renderAsTag}
          selectedOption={controlSelectedOption}
          isDisabled={isDisabled}
          selectSizeVariant={selectSizeVariant}
          hasRightElement={hasRightElement}
          variant={variant}
        />
      ) : (
        <DropdownRoot dropdownId={dropdownId} type="picker">
          <Dropdown.Trigger render={<div />} nativeButton={false}>
            <SelectControl
              renderAsTag={renderAsTag}
              selectedOption={controlSelectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
              hasRightElement={hasRightElement}
              variant={variant}
            />
          </Dropdown.Trigger>
          <DropdownContent
            ref={dropdownContentRef}
            initialFocus={
              withSearchInput
                ? undefined
                : () =>
                    dropdownContentRef.current?.querySelector<HTMLElement>(
                      '[data-dropdown-item][aria-pressed="true"]:not([aria-disabled="true"])',
                    ) ??
                    dropdownContentRef.current?.querySelector<HTMLElement>(
                      '[data-dropdown-item]:not([aria-disabled="true"])',
                    ) ??
                    true
            }
            width={dropDownMenuWidth}
            align="start"
            sideOffset={dropdownOffset?.y ?? 0}
            alignOffset={dropdownOffset?.x ?? 0}
          >
            {withSearchInput === true && (
              <Dropdown.Search
                value={searchInputValue}
                onValueChange={setSearchInputValue}
                placeholder={t`Search`}
                aria-label={t`Search`}
              />
            )}
            {withSearchInput === true && isNonEmptyArray(filteredOptions) && (
              <Dropdown.Separator />
            )}
            {isDefined(pinnedOption) && (
              <Dropdown.Section>
                <Dropdown.OptionItem
                  onSelect={() => {
                    onChange?.(pinnedOption.value);
                    onBlur?.();
                  }}
                  disabled={pinnedOption.disabled}
                  selected={controlSelectedOption.value === pinnedOption.value}
                  indicator={needIconCheck ? 'check' : 'none'}
                  description={pinnedOption.contextualText}
                  startIcon={
                    <>
                      <SelectOptionIcon
                        Icon={pinnedOption.Icon}
                        color={pinnedOption.iconThemeColor}
                      />
                      {pinnedOption.LeftComponent}
                    </>
                  }
                >
                  {pinnedOption.label}
                </Dropdown.OptionItem>
              </Dropdown.Section>
            )}
            {isDefined(pinnedOption) && isNonEmptyArray(filteredOptions) && (
              <Dropdown.Separator />
            )}
            {isNonEmptyArray(filteredOptions) && (
              <Dropdown.Section scrollable>
                {filteredOptions.map((option) => {
                  const tagColor = renderAsTag ? option.color : undefined;
                  const isColoredTag = isDefined(tagColor);

                  return (
                    <Dropdown.OptionItem
                      key={`${option.value}-${option.label}`}
                      onSelect={() => {
                        onChange?.(option.value);
                        onBlur?.();
                      }}
                      disabled={option.disabled}
                      selected={controlSelectedOption.value === option.value}
                      indicator={
                        isColoredTag || needIconCheck ? 'check' : 'none'
                      }
                      description={
                        isColoredTag ? undefined : option.contextualText
                      }
                      startIcon={
                        isColoredTag ? undefined : (
                          <>
                            <SelectOptionIcon
                              Icon={option.Icon}
                              color={option.iconThemeColor}
                            />
                            {option.LeftComponent}
                          </>
                        )
                      }
                    >
                      {isColoredTag ? (
                        <Tag
                          color={tagColor}
                          borderStyle="dashed"
                          variant="soft"
                        >
                          {option.label}
                        </Tag>
                      ) : (
                        option.label
                      )}
                    </Dropdown.OptionItem>
                  );
                })}
              </Dropdown.Section>
            )}
            {isDefined(callToActionButton) &&
              isNonEmptyArray(filteredOptions) && <Dropdown.Separator />}
            {isDefined(callToActionButton) && (
              <Dropdown.Section>
                <Dropdown.ActionItem
                  onClick={callToActionButton.onClick}
                  closeOnClick={false}
                  startIcon={
                    <SelectOptionIcon Icon={callToActionButton.Icon} />
                  }
                >
                  {callToActionButton.text}
                </Dropdown.ActionItem>
              </Dropdown.Section>
            )}
          </DropdownContent>
        </DropdownRoot>
      )}
      {isNonEmptyString(description) && (
        <StyledDescription>{description}</StyledDescription>
      )}
    </StyledContainer>
  );
};
