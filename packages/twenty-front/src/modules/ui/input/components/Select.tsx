import { styled } from '@linaria/react';
import { type MouseEvent, useMemo, useRef, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type SelectSizeVariant = 'small' | 'default';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

export type SelectProps<Value extends SelectValue> = {
  className?: string;
  disabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  dropdownId: string;
  dropdownWidth?: number;
  dropdownWidthAuto?: boolean;
  emptyOption?: SelectOption<Value>;
  fullWidth?: boolean;
  label?: string;
  description?: string;
  onChange?: (value: Value) => void;
  onBlur?: () => void;
  options: SelectOption<Value>[];
  value?: Value;
  withSearchInput?: boolean;
  needIconCheck?: boolean;
  pinnedOption?: SelectOption<Value>;
  callToActionButton?: CallToActionButton;
  dropdownOffset?: DropdownOffset;
  hasRightElement?: boolean;
  showContextualTextInControl?: boolean;
};

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

export const Select = <Value extends SelectValue>({
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
}: SelectProps<Value>) => {
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

    if (options.length > 0) {
      return options[0];
    }

    return null;
  }, [emptyOption, options, pinnedOption, value]);

  const filteredOptions = useMemo(
    () =>
      searchInputValue
        ? options.filter(({ label }) =>
            label.toLowerCase().includes(searchInputValue.toLowerCase()),
          )
        : options,
    [options, searchInputValue],
  );

  const isDisabled =
    disabledFromProps ||
    (options.length <= 1 &&
      !isDefined(pinnedOption) &&
      !isDefined(callToActionButton) &&
      (!isDefined(emptyOption) || selectedOption !== emptyOption));

  const { closeDropdown } = useCloseDropdown();

  const dropDownMenuWidth =
    dropdownWidthAuto && selectContainerRef.current?.clientWidth
      ? selectContainerRef.current?.clientWidth
      : dropdownWidth;

  const selectableItemIdArray = filteredOptions.map((option) => option.label);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { setSelectedItemId } = useSelectableList(dropdownId);

  const controlSelectedOption = useMemo(() => {
    if (!isDefined(selectedOption) || showContextualTextInControl) {
      return selectedOption;
    }

    const { contextualText: _, ...rest } = selectedOption;

    return rest;
  }, [selectedOption, showContextualTextInControl]);

  const handleDropdownOpen = () => {
    if (
      isDefined(controlSelectedOption) &&
      !isNonEmptyString(searchInputValue)
    ) {
      setSelectedItemId(controlSelectedOption.label);
    }
  };

  if (!isDefined(controlSelectedOption)) {
    return <></>;
  }

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth}
      tabIndex={0}
      onBlur={onBlur}
      ref={selectContainerRef}
    >
      {isNonEmptyString(label) && <StyledLabel>{label}</StyledLabel>}
      {isDisabled ? (
        <SelectControl
          selectedOption={controlSelectedOption}
          isDisabled={isDisabled}
          selectSizeVariant={selectSizeVariant}
          hasRightElement={hasRightElement}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-start"
          dropdownOffset={dropdownOffset}
          onOpen={handleDropdownOpen}
          clickableComponent={
            <SelectControl
              selectedOption={controlSelectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
              hasRightElement={hasRightElement}
            />
          }
          dropdownComponents={
            <DropdownContent widthInPixels={dropDownMenuWidth}>
              {withSearchInput === true && (
                <DropdownMenuSearchInput
                  autoFocus
                  value={searchInputValue}
                  onChange={(event) => setSearchInputValue(event.target.value)}
                />
              )}
              {withSearchInput === true && isNonEmptyArray(filteredOptions) && (
                <DropdownMenuSeparator />
              )}
              {isDefined(pinnedOption) && (
                <DropdownMenuItemsContainer scrollable={false}>
                  <MenuItemSelect
                    LeftIcon={pinnedOption.Icon}
                    leftIconColor={pinnedOption.iconThemeColor}
                    text={pinnedOption.label}
                    contextualText={pinnedOption.contextualText}
                    selected={
                      controlSelectedOption.value === pinnedOption.value
                    }
                    needIconCheck={needIconCheck}
                    onClick={() => {
                      onChange?.(pinnedOption.value);
                      onBlur?.();
                      closeDropdown(dropdownId);
                    }}
                  />
                </DropdownMenuItemsContainer>
              )}
              {isDefined(pinnedOption) && isNonEmptyArray(filteredOptions) && (
                <DropdownMenuSeparator />
              )}
              {isNonEmptyArray(filteredOptions) && (
                <DropdownMenuItemsContainer hasMaxHeight>
                  <SelectableList
                    selectableListInstanceId={dropdownId}
                    focusId={dropdownId}
                    selectableItemIdArray={selectableItemIdArray}
                  >
                    {filteredOptions.map((option) => (
                      <SelectableListItem
                        key={`${option.value}-${option.label}`}
                        itemId={option.label}
                        onEnter={() => {
                          onChange?.(option.value);
                          onBlur?.();
                          closeDropdown(dropdownId);
                        }}
                      >
                        <MenuItemSelect
                          LeftIcon={option.Icon}
                          leftIconColor={option.iconThemeColor}
                          text={option.label}
                          contextualText={option.contextualText}
                          selected={
                            controlSelectedOption.value === option.value
                          }
                          focused={selectedItemId === option.label}
                          needIconCheck={needIconCheck}
                          onClick={() => {
                            onChange?.(option.value);
                            onBlur?.();
                            closeDropdown(dropdownId);
                          }}
                        />
                      </SelectableListItem>
                    ))}
                  </SelectableList>
                </DropdownMenuItemsContainer>
              )}
              {isDefined(callToActionButton) &&
                isNonEmptyArray(filteredOptions) && <DropdownMenuSeparator />}
              {isDefined(callToActionButton) && (
                <DropdownMenuItemsContainer hasMaxHeight scrollable={false}>
                  <MenuItem
                    onClick={callToActionButton.onClick}
                    LeftIcon={callToActionButton.Icon}
                    text={callToActionButton.text}
                  />
                </DropdownMenuItemsContainer>
              )}
            </DropdownContent>
          }
        />
      )}
      {isNonEmptyString(description) && (
        <StyledDescription>{description}</StyledDescription>
      )}
    </StyledContainer>
  );
};
