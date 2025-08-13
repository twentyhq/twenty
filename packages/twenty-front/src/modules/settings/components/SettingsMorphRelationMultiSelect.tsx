import styled from '@emotion/styled';
import { useMemo, useRef, useState, type MouseEvent } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, type IconComponent } from 'twenty-ui/display';
import { type MultiSelectOption } from 'twenty-ui/input';
import { MenuItem, MenuItemMultiSelect } from 'twenty-ui/navigation';

export type SelectSizeVariant = 'small' | 'default';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

type MorphRelationOptionType = {
  objectMetadataId: string;
  objectMetadataNameSingular: string;
};

export type SettingsMorphRelationMultiSelectProps<T> = {
  className?: string;
  disabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  dropdownId: string;
  dropdownWidth?: number;
  dropdownWidthAuto?: boolean;

  fullWidth?: boolean;
  label?: string;
  description?: string;
  onChange?: (value: T[]) => void;
  onBlur?: () => void;
  options: MultiSelectOption<T>[];
  value: T[];
  withSearchInput?: boolean;
  needIconCheck?: boolean;
  callToActionButton?: CallToActionButton;
  dropdownOffset?: DropdownOffset;
  hasRightElement?: boolean;
};

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const SettingsMorphRelationMultiSelect = ({
  className,
  disabled: disabledFromProps,
  selectSizeVariant,
  dropdownId,
  dropdownWidth = GenericDropdownContentWidth.Medium,
  dropdownWidthAuto = false,
  fullWidth,
  label,
  description,
  onChange,
  onBlur,
  options,
  value,
  withSearchInput,
  callToActionButton,
  dropdownOffset,
  hasRightElement,
}: SettingsMorphRelationMultiSelectProps<MorphRelationOptionType>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const [searchInputValue, setSearchInputValue] = useState('');

  const morphRelations = value;

  const selectedOptions =
    options.filter(({ value: key }) =>
      morphRelations.find(
        (morphRelation) =>
          morphRelation.objectMetadataId === key.objectMetadataId,
      ),
    ) || options[0];

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
    (options.length <= 1 && !isDefined(callToActionButton));

  const { closeDropdown } = useCloseDropdown();

  const dropDownMenuWidth =
    dropdownWidthAuto && selectContainerRef.current?.clientWidth
      ? selectContainerRef.current?.clientWidth
      : dropdownWidth;

  const selectableItemIdArray = filteredOptions.map((option) => option.label);

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { setSelectedItemId } = useSelectableList(dropdownId);

  const handleDropdownOpen = () => {
    if (selectedOptions && !searchInputValue) {
      setSelectedItemId(selectedOptions[0].label);
    }
  };

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth}
      tabIndex={0}
      onBlur={onBlur}
      ref={selectContainerRef}
    >
      {!!label && <StyledLabel>{label}</StyledLabel>}
      {isDisabled ? (
        <MultiSelectControl<MorphRelationOptionType>
          selectedOptions={selectedOptions}
          fixedIcon={IconBox}
          fixedText="Object"
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
            <MultiSelectControl<MorphRelationOptionType>
              selectedOptions={selectedOptions}
              fixedIcon={IconBox}
              fixedText="Object"
              isDisabled={isDisabled}
              selectSizeVariant={selectSizeVariant}
              hasRightElement={hasRightElement}
            />
          }
          dropdownComponents={
            <DropdownContent widthInPixels={dropDownMenuWidth}>
              {!!withSearchInput && (
                <DropdownMenuSearchInput
                  autoFocus
                  value={searchInputValue}
                  onChange={(event) => setSearchInputValue(event.target.value)}
                />
              )}
              {!!withSearchInput && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!filteredOptions.length && (
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
                          onChange?.([option.value]);
                          onBlur?.();
                          closeDropdown(dropdownId);
                        }}
                      >
                        <MenuItemMultiSelect
                          className=""
                          LeftIcon={option.Icon ?? undefined}
                          text={option.label}
                          selected={selectedOptions.some(
                            (selectedOption) =>
                              selectedOption.value.objectMetadataId ===
                              option.value.objectMetadataId,
                          )}
                          isKeySelected={selectedItemId === option.label}
                          onSelectChange={() => {
                            let newMorphRelations = [...morphRelations];
                            const alreadySelected = newMorphRelations.find(
                              (morphRelation) =>
                                morphRelation.objectMetadataId ===
                                option.value.objectMetadataId,
                            );
                            if (isDefined(alreadySelected)) {
                              newMorphRelations = newMorphRelations.filter(
                                (newMorphRelation) =>
                                  newMorphRelation !== alreadySelected,
                              );
                            } else {
                              newMorphRelations.push(option.value);
                            }

                            onChange?.(newMorphRelations);
                            onBlur?.();
                          }}
                        />{' '}
                      </SelectableListItem>
                    ))}
                  </SelectableList>
                </DropdownMenuItemsContainer>
              )}
              {!!callToActionButton && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!callToActionButton && (
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
      {!!description && <StyledDescription>{description}</StyledDescription>}
    </StyledContainer>
  );
};
