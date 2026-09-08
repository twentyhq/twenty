import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type MouseEvent, useId, useMemo, useRef, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { AppTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export type SelectSizeVariant = 'small' | 'default';

export type CallToActionButton = {
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
  isDropdownInModal?: boolean;
  variant?: FormFieldInputVariant;
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

const StyledOptionHoverCardAnchor = styled.div`
  width: 100%;
`;

const optionHoverCardTooltipClass = css`
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
`;

type SelectOptionMenuItemProps<Value extends SelectValue> = {
  option: SelectOption<Value>;
  selected: boolean;
  focused?: boolean;
  needIconCheck?: boolean;
  hoverCardAnchorId: string;
  onHoverCardAnchorChange: (anchorId: string | null) => void;
  onClick: () => void;
};

const SelectOptionMenuItem = <Value extends SelectValue>({
  option,
  selected,
  focused,
  needIconCheck,
  hoverCardAnchorId,
  onHoverCardAnchorChange,
  onClick,
}: SelectOptionMenuItemProps<Value>) => (
  <StyledOptionHoverCardAnchor
    id={hoverCardAnchorId}
    onMouseEnter={() => onHoverCardAnchorChange(hoverCardAnchorId)}
  >
    <MenuItemSelect
      LeftIcon={option.Icon}
      leftIconColor={option.iconThemeColor}
      text={option.label}
      contextualText={option.contextualText}
      selected={selected}
      focused={focused}
      needIconCheck={needIconCheck}
      onClick={onClick}
    />
  </StyledOptionHoverCardAnchor>
);

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
  isDropdownInModal = false,
  variant = 'default',
}: SelectProps<Value>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const selectInstanceId = useId().replace(/[^a-zA-Z0-9-_]/g, '');

  const [searchInputValue, setSearchInputValue] = useState('');
  const [hoveredHoverCardAnchorId, setHoveredHoverCardAnchorId] = useState<
    string | null
  >(null);

  const getHoverCardAnchorId = (section: 'pinned' | 'option', index: number) =>
    `${dropdownId}-${selectInstanceId}-${section}-${index}`;

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

  const { closeDropdown } = useCloseDropdown();

  const dropDownMenuWidth =
    dropdownWidthAuto && selectContainerRef.current?.clientWidth
      ? selectContainerRef.current?.clientWidth
      : dropdownWidth;

  const selectableItemIdArray = filteredOptions.map((option) => option.label);

  const scopedDropdownId =
    useWorkspaceSurfaceScopedComponentInstanceId(dropdownId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    scopedDropdownId,
  );

  const { setSelectedItemId } = useSelectableList(dropdownId);

  const pinnedOptionEntry = isDefined(pinnedOption)
    ? {
        option: pinnedOption,
        hoverCardAnchorId: getHoverCardAnchorId('pinned', 0),
      }
    : undefined;

  const optionEntries = filteredOptions.map((option, index) => ({
    option,
    hoverCardAnchorId: getHoverCardAnchorId('option', index),
  }));

  const focusedHoverCardEntry =
    pinnedOptionEntry?.option.label === selectedItemId
      ? pinnedOptionEntry
      : optionEntries.find(({ option }) => option.label === selectedItemId);

  const activeHoverCardEntry = isDefined(hoveredHoverCardAnchorId)
    ? [
        ...(isDefined(pinnedOptionEntry) ? [pinnedOptionEntry] : []),
        ...optionEntries,
      ].find(
        ({ hoverCardAnchorId }) =>
          hoverCardAnchorId === hoveredHoverCardAnchorId,
      )
    : focusedHoverCardEntry;

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
      tabIndex={isDisabled ? 0 : undefined}
      onBlur={onBlur}
      onKeyDownCapture={(event) => {
        if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
          setHoveredHoverCardAnchorId(null);
        }
      }}
      ref={selectContainerRef}
    >
      {isNonEmptyString(label) && <StyledLabel>{label}</StyledLabel>}
      {isDisabled ? (
        <SelectControl
          selectedOption={controlSelectedOption}
          isDisabled={isDisabled}
          selectSizeVariant={selectSizeVariant}
          hasRightElement={hasRightElement}
          variant={variant}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-start"
          dropdownOffset={dropdownOffset}
          isDropdownInModal={isDropdownInModal}
          enableKeyboardActivation
          onOpen={handleDropdownOpen}
          onClose={() => setHoveredHoverCardAnchorId(null)}
          clickableComponent={
            <SelectControl
              selectedOption={controlSelectedOption}
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
              hasRightElement={hasRightElement}
              variant={variant}
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
                  <SelectOptionMenuItem
                    option={pinnedOption}
                    selected={
                      controlSelectedOption.value === pinnedOption.value
                    }
                    needIconCheck={needIconCheck}
                    hoverCardAnchorId={getHoverCardAnchorId('pinned', 0)}
                    onHoverCardAnchorChange={setHoveredHoverCardAnchorId}
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
                    {optionEntries.map(({ option, hoverCardAnchorId }) => (
                      <SelectableListItem
                        key={`${option.value}-${option.label}`}
                        itemId={option.label}
                        onEnter={() => {
                          onChange?.(option.value);
                          onBlur?.();
                          closeDropdown(dropdownId);
                        }}
                      >
                        <SelectOptionMenuItem
                          option={option}
                          selected={
                            controlSelectedOption.value === option.value
                          }
                          focused={selectedItemId === option.label}
                          needIconCheck={needIconCheck}
                          hoverCardAnchorId={hoverCardAnchorId}
                          onHoverCardAnchorChange={setHoveredHoverCardAnchorId}
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
              {isDefined(activeHoverCardEntry?.option.hoverCardContent) && (
                <AppTooltip
                  anchorSelect={`#${activeHoverCardEntry.hoverCardAnchorId}`}
                  place="right-start"
                  clickable
                  noArrow
                  offset={8}
                  className={optionHoverCardTooltipClass}
                  width="300px"
                  isOpen={true}
                >
                  <div
                    onKeyDownCapture={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        closeDropdown(dropdownId);
                        selectContainerRef.current
                          ?.querySelector<HTMLElement>('[role="button"]')
                          ?.focus();
                      }
                    }}
                  >
                    {activeHoverCardEntry.option.hoverCardContent}
                  </div>
                </AppTooltip>
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
