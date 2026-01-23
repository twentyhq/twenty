import styled from '@emotion/styled';
import { plural } from '@lingui/core/macro';
import { useMemo, useState, useCallback, type MouseEvent } from 'react';

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
import { isNonEmptyString } from '@sniptt/guards';
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
  error?: string;
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

const StyledError = styled.span`
  color: ${({ theme }) => theme.color.red};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
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
  error,
}: SettingsMorphRelationMultiSelectProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [lastDeselectedId, setLastDeselectedId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    undefined,
  );

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const [localSelectedObjectMetadataIds, setLocalSelectedObjectMetadataIds] =
    useState<string[]>(selectedObjectMetadataIds);

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
    localSelectedObjectMetadataIds.includes(option.objectMetadataId),
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
    dropdownWidthAuto && containerWidth ? containerWidth : dropdownWidth;

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

  const handleToggleSelection = useCallback(
    (objectMetadataId: string) => {
      const isCurrentlySelected =
        selectedObjectMetadataIds.includes(objectMetadataId);

      if (isCurrentlySelected) {
        // Remove the item
        const newSelectedObjectMetadataIds = selectedObjectMetadataIds.filter(
          (id) => id !== objectMetadataId,
        );
        // Track the deselected item only if selection becomes empty
        if (newSelectedObjectMetadataIds.length === 0) {
          setLastDeselectedId(objectMetadataId);
        } else {
          setLastDeselectedId(null);
        }
        onChange?.(newSelectedObjectMetadataIds);
      } else {
        // Add the item
        // If we recently deselected an item and it's back in the selection
        // (likely reverted by form validation), replace the entire selection
        // with just the new item to prevent the old item from being included
        if (
          isDefined(lastDeselectedId) &&
          selectedObjectMetadataIds.includes(lastDeselectedId)
        ) {
          // The form reverted to include the deselected item, so replace it entirely
          onChange?.([objectMetadataId]);
          setLastDeselectedId(null);
        } else {
          // Normal case: add the item
          const newSelectedObjectMetadataIds = Array.from(
            new Set([...selectedObjectMetadataIds, objectMetadataId]),
          );
          onChange?.(newSelectedObjectMetadataIds);
          setLastDeselectedId(null);
        }
      }
    },
    [selectedObjectMetadataIds, onChange, lastDeselectedId],
  );

  const handleContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (isDefined(element) && dropdownWidthAuto) {
        setContainerWidth(element.clientWidth);
      }
    },
    [dropdownWidthAuto],
  );

  const handleContainerBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // Check if focus is moving outside the container
      const currentTarget = event.currentTarget;
      const relatedTarget = event.relatedTarget as Node | null;

      if (
        !currentTarget.contains(relatedTarget) &&
        selectedObjectMetadataIds.length === 0 &&
        isDefined(lastDeselectedId)
      ) {
        // Dropdown closed with 0 selections, re-add the last deselected item
        onChange?.([lastDeselectedId]);
        setLastDeselectedId(null);
      }

      onBlur?.();
    },
    [selectedObjectMetadataIds, lastDeselectedId, onChange, onBlur],
  );

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth}
      tabIndex={0}
      onBlur={handleContainerBlur}
      ref={handleContainerRef}
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
                          handleToggleSelection(option.objectMetadataId);
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
                            handleToggleSelection(option.objectMetadataId);
                            onBlur?.();
                          }}
                        />
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
      {isNonEmptyString(description) && (
        <StyledDescription>{description}</StyledDescription>
      )}
      {isNonEmptyString(error) && <StyledError>{error}</StyledError>}
    </StyledContainer>
  );
};
