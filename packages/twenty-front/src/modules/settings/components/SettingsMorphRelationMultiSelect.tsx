import styled from '@emotion/styled';
import { plural } from '@lingui/core/macro';
import { useMemo, useRef, useState, type MouseEvent } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
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
import { IconBox, useIcons, type IconComponent } from 'twenty-ui/display';
import { MenuItem, MenuItemMultiSelect } from 'twenty-ui/navigation';

export type SelectSizeVariant = 'small' | 'default';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

export type SettingsMorphRelationMultiSelectProps = {
  className?: string;
  disabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  dropdownId: string;
  dropdownWidth?: number;
  dropdownWidthAuto?: boolean;
  fullWidth?: boolean;
  label?: string;
  description?: string;
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  selectedObjectMetadataIds: string[];
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
  selectedObjectMetadataIds,
  withSearchInput,
  callToActionButton,
  dropdownOffset,
  hasRightElement,
}: SettingsMorphRelationMultiSelectProps) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const [searchInputValue, setSearchInputValue] = useState('');

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const { getIcon } = useIcons();
  const options = activeObjectMetadataItems
    .filter(isObjectMetadataAvailableForRelation)
    .sort((item1, item2) =>
      item1.labelSingular.localeCompare(item2.labelSingular),
    )
    .map((objectMetadataItem) => ({
      label: objectMetadataItem.labelSingular,
      Icon: getIcon(objectMetadataItem.icon),
      objectMetadataId: objectMetadataItem.id,
    }));

  const selectedOptions = options.filter((option) =>
    selectedObjectMetadataIds.includes(option.objectMetadataId),
  );

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
    if (selectedOptions && selectedOptions.length > 0 && !searchInputValue) {
      setSelectedItemId(selectedOptions[0].label);
    }
  };

  const addOrRemoveFromArray = (array: string[], item: string) => {
    let newArray = new Set(array);
    if (newArray.has(item)) {
      if (newArray.size <= 1) {
        return array;
      }
      newArray.delete(item);
    } else {
      newArray.add(item);
    }
    return Array.from(newArray);
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
        <MultiSelectControl
          selectedOptions={selectedOptions}
          fixedIcon={selectedOptions.length < 2 ? undefined : IconBox}
          fixedText={
            selectedOptions.length < 2
              ? undefined
              : plural(selectedOptions.length, {
                  one: `# Object`,
                  other: `# Objects`,
                })
          }
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
            <MultiSelectControl
              selectedOptions={selectedOptions}
              fixedIcon={selectedOptions.length < 2 ? undefined : IconBox}
              fixedText={
                selectedOptions.length < 2
                  ? undefined
                  : plural(selectedOptions.length, {
                      one: `# Object`,
                      other: `# Objects`,
                    })
              }
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
                        key={`${option.objectMetadataId}-${option.label}`}
                        itemId={option.label}
                        onEnter={() => {
                          const newSelectedObjectMetadataIds =
                            addOrRemoveFromArray(
                              selectedObjectMetadataIds,
                              option.objectMetadataId,
                            );
                          onChange?.(newSelectedObjectMetadataIds);
                          onBlur?.();
                          closeDropdown(dropdownId);
                        }}
                      >
                        <MenuItemMultiSelect
                          className=""
                          LeftIcon={option.Icon ?? undefined}
                          text={option.label}
                          selected={selectedObjectMetadataIds.some(
                            (selectedObjectMetadataId) =>
                              selectedObjectMetadataId ===
                              option.objectMetadataId,
                          )}
                          isKeySelected={selectedItemId === option.label}
                          onSelectChange={() => {
                            let newSelectedObjectMetadataIds =
                              addOrRemoveFromArray(
                                selectedObjectMetadataIds,
                                option.objectMetadataId,
                              );

                            onChange?.(newSelectedObjectMetadataIds);
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
