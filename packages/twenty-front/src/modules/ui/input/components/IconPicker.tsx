import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import React, { type ReactNode, useCallback, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconButton,
  LightIconButton,
  getIconTileColorShades,
} from 'twenty-ui/components';
import { IconApps, type IconComponent, useIcons } from 'twenty-ui/icon';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import {
  type ButtonSize,
  type ButtonVariant,
} from 'twenty-ui/primitives/input';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { IconPickerScrollEffect } from '@/ui/input/effect-components/IconPickerScrollEffect';
import {
  ICON_PICKER_DEFAULT_VISIBLE_COUNT,
  iconPickerVisibleCountState,
} from '@/ui/input/states/iconPickerVisibleCountState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

export type IconPickerProps = {
  disabled?: boolean;
  dropdownId?: string;
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  variant?: ButtonVariant;
  className?: string;
  size?: ButtonSize;
  clickableComponent?: ReactNode;
  dropdownWidth?: number;
  dropdownOffset?: DropdownOffset;
  maxIconsVisible?: number;
  iconColor?: ThemeColor;
  iconColorPicker?: {
    selectedColor: ThemeColor;
    onColorChange: (color: ThemeColor) => void;
  };
};

const StyledIconPickerSearchRow = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type IconPickerSearchRowProps = {
  closeDropdown: (dropdownId: string) => void;
  dropdownWidth: number | undefined;
  iconColorPicker: IconPickerProps['iconColorPicker'];
  iconColorPickerDropdownId: string;
  onSearchChange: (searchString: string) => void;
};

const IconPickerSearchRow = ({
  closeDropdown,
  dropdownWidth,
  iconColorPicker,
  iconColorPickerDropdownId,
  onSearchChange,
}: IconPickerSearchRowProps) => {
  const searchInput = (
    <DropdownMenuSearchInput
      placeholder={t`Search icon`}
      autoFocus
      onChange={(event) => {
        onSearchChange(event.target.value);
      }}
    />
  );

  if (!isDefined(iconColorPicker)) {
    return searchInput;
  }

  return (
    <StyledIconPickerSearchRow>
      {searchInput}
      <ClickOutsideListenerContext.Provider
        value={{
          excludedClickOutsideId: iconColorPickerDropdownId,
        }}
      >
        <Dropdown
          dropdownId={iconColorPickerDropdownId}
          dropdownOffset={{
            x: 24,
            y: -24,
          }}
          dropdownPlacement="right-start"
          clickableComponent={
            <LightIconButton aria-label={t`Choose icon color`}>
              <ColorSample
                colorName={iconColorPicker.selectedColor}
                variant="circle"
              />
            </LightIconButton>
          }
          dropdownComponents={
            <LegacyDropdownContent
              widthInPixels={
                dropdownWidth || ICON_PICKER_DROPDOWN_CONTENT_WIDTH
              }
            >
              <ThemeColorPickerMenu
                selectedColor={iconColorPicker.selectedColor}
                onSelectColor={(nextColor) => {
                  iconColorPicker.onColorChange(nextColor);
                  closeDropdown(iconColorPickerDropdownId);
                }}
              />
            </LegacyDropdownContent>
          }
        />
      </ClickOutsideListenerContext.Provider>
    </StyledIconPickerSearchRow>
  );
};

const StyledMenuIconItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[0.5]};
`;

const selectedIconButtonStyle = css`
  background: ${themeCssVariables.background.transparent.medium};
`;

const focusedIconButtonStyle = css`
  background: ${themeCssVariables.background.transparent.light};
`;

type StyledLightIconButtonProps = Pick<
  React.ComponentProps<typeof LightIconButton>,
  'aria-label' | 'children' | 'size' | 'title' | 'onClick' | 'className'
> & {
  isSelected?: boolean;
  isFocused?: boolean;
};

const StyledLightIconButton = ({
  isSelected,
  isFocused,
  className,
  'aria-label': ariaLabel,
  children,
  size,
  title,
  onClick,
}: StyledLightIconButtonProps) => (
  <LightIconButton
    aria-label={ariaLabel}
    size={size}
    title={title}
    onClick={onClick}
    aria-pressed={isSelected}
    className={`${className ?? ''} ${isSelected ? selectedIconButtonStyle : isFocused ? focusedIconButtonStyle : ''}`}
  >
    {children}
  </LightIconButton>
);

const StyledLoadingMore = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  height: 40px;
  justify-content: center;
`;

const StyledMatrixItem = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const convertIconKeyToLabel = (iconKey: string) =>
  iconKey.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

type IconPickerIconProps = {
  iconKey: string;
  onSelect: () => void;
  selectedIconKey?: string;
  Icon: IconComponent;
  focusedIconKey?: string;
  color?: ThemeColor;
};

const IconPickerIcon = ({
  iconKey,
  onSelect,
  selectedIconKey,
  Icon,
  focusedIconKey,
  color,
}: IconPickerIconProps) => {
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    iconKey,
  );

  return (
    <StyledMatrixItem>
      <SelectableListItem itemId={iconKey} onEnter={onSelect}>
        <StyledLightIconButton
          key={iconKey}
          aria-label={convertIconKeyToLabel(iconKey)}
          size="md"
          title={iconKey}
          isSelected={iconKey === selectedIconKey || !!selectedItemId}
          isFocused={iconKey === focusedIconKey}
          onClick={onSelect}
        >
          <Icon
            color={
              isDefined(color)
                ? getIconTileColorShades(color).iconColor
                : undefined
            }
          />
        </StyledLightIconButton>
      </SelectableListItem>
    </StyledMatrixItem>
  );
};

export const IconPicker = ({
  disabled,
  dropdownId = 'icon-picker',
  onChange,
  selectedIconKey,
  onClickOutside,
  onClose,
  onOpen,
  variant = 'outline',
  className,
  size = 'md',
  clickableComponent,
  dropdownWidth,
  dropdownOffset,
  maxIconsVisible,
  iconColorPicker,
  iconColor,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');

  const [isMouseInsideIconList, setIsMouseInsideIconList] = useState(false);

  const handleMouseEnter = () => {
    if (!isMouseInsideIconList) {
      setIsMouseInsideIconList(true);
    }
  };

  const handleMouseLeave = () => {
    if (isMouseInsideIconList) {
      setIsMouseInsideIconList(false);
    }
  };

  const { closeDropdown } = useCloseDropdown();

  const store = useStore();

  const iconPickerVisibleCount =
    useAtomFamilyStateValue(iconPickerVisibleCountState, dropdownId) ??
    maxIconsVisible;

  const resetIconPickerVisibleCount = useCallback(() => {
    store.set(
      iconPickerVisibleCountState.atomFamily(dropdownId),
      ICON_PICKER_DEFAULT_VISIBLE_COUNT,
    );
  }, [store, dropdownId]);

  const { getIcons, getIcon } = useIcons();
  const icons = getIcons();

  const totalMatchingIconsCount = useMemo(() => {
    if (!isDefined(icons)) return 0;

    return Object.keys(icons).filter((iconKey) => {
      const iconLabel = convertIconKeyToLabel(iconKey)
        .toLowerCase()
        .replace('icon ', '')
        .replace(/\s/g, '');

      const searchLower = searchString.toLowerCase().trim().replace(/\s/g, '');

      return (
        iconKey === searchLower ||
        iconLabel === searchLower ||
        iconKey.startsWith(searchLower) ||
        iconLabel.startsWith(searchLower) ||
        iconKey.includes(searchLower) ||
        iconLabel.includes(searchLower)
      );
    }).length;
  }, [icons, searchString]);

  const matchingSearchIconKeys = useMemo(() => {
    if (icons == null) return [];
    const scoreIconMatch = (iconKey: string, searchString: string) => {
      const iconLabel = convertIconKeyToLabel(iconKey)
        .toLowerCase()
        .replace('icon ', '')
        .replace(/\s/g, '');

      const searchLower = searchString
        .toLowerCase()
        .trimEnd()
        .replace(/\s/g, '');

      if (iconKey === searchString || iconLabel === searchString) return 100;
      if (iconKey.startsWith(searchLower) || iconLabel.startsWith(searchLower))
        return 75;
      if (iconKey.includes(searchLower) || iconLabel.includes(searchLower))
        return 50;

      return 0;
    };
    const scoredIcons = Object.keys(icons).map((iconKey) => ({
      iconKey,
      score: scoreIconMatch(iconKey, searchString),
    }));

    const filteredAndSortedIconKeys = scoredIcons
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ iconKey }) => iconKey);

    const isSelectedIconMatchingFilter =
      isDefined(selectedIconKey) &&
      filteredAndSortedIconKeys.includes(selectedIconKey);

    return isSelectedIconMatchingFilter
      ? [
          selectedIconKey,
          ...filteredAndSortedIconKeys.filter(
            (iconKey) => iconKey !== selectedIconKey,
          ),
        ].slice(0, iconPickerVisibleCount)
      : filteredAndSortedIconKeys.slice(0, iconPickerVisibleCount);
  }, [icons, searchString, selectedIconKey, iconPickerVisibleCount]);

  const iconKeys2d = useMemo(
    () => arrayToChunks(matchingSearchIconKeys.slice(), 5),
    [matchingSearchIconKeys],
  );

  const BaseIcon = selectedIconKey ? getIcon(selectedIconKey) : IconApps;

  const selectedColor = iconColorPicker?.selectedColor ?? iconColor;

  const DisplayIcon: IconComponent = !isDefined(selectedColor)
    ? BaseIcon
    : (iconProps) => (
        <BaseIcon
          className={iconProps.className}
          color={getIconTileColorShades(selectedColor).iconColor}
          size={iconProps.size}
          stroke={iconProps.stroke}
          style={iconProps.style}
        />
      );

  const iconColorPickerDropdownId = `${dropdownId}-icon-color-picker`;
  const selectableListInstanceId = `${dropdownId}-icon-list`;

  const focusedIconKey =
    useAtomComponentStateValue(
      selectedItemIdComponentState,
      selectableListInstanceId,
    ) ?? undefined;

  const isLoadingMore =
    iconPickerVisibleCount !== undefined &&
    iconPickerVisibleCount < totalMatchingIconsCount;

  const iconAriaLabel = selectedIconKey
    ? t`(selected: ${selectedIconKey})`
    : t`(no icon selected)`;

  return (
    <div className={className}>
      <Dropdown
        dropdownId={dropdownId}
        dropdownOffset={dropdownOffset}
        excludedClickOutsideIds={
          isDefined(iconColorPicker) ? [iconColorPickerDropdownId] : undefined
        }
        clickableComponent={
          clickableComponent ?? (
            <IconButton
              aria-label={t`Click to select icon ${iconAriaLabel}`}
              disabled={disabled}
              variant={variant}
              size={size}
            >
              <DisplayIcon />
            </IconButton>
          )
        }
        dropdownComponents={
          <ScrollWrapper componentInstanceId="icon-picker-scroll">
            <LegacyDropdownContent
              widthInPixels={
                dropdownWidth || ICON_PICKER_DROPDOWN_CONTENT_WIDTH
              }
            >
              <SelectableList
                selectableListInstanceId={selectableListInstanceId}
                selectableItemIdMatrix={iconKeys2d}
                focusId={dropdownId}
              >
                <IconPickerSearchRow
                  closeDropdown={closeDropdown}
                  dropdownWidth={dropdownWidth}
                  iconColorPicker={iconColorPicker}
                  iconColorPickerDropdownId={iconColorPickerDropdownId}
                  onSearchChange={setSearchString}
                />
                <DropdownMenuSeparator />
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <DropdownMenuItemsContainer hasMaxHeight>
                    <StyledMenuIconItemsContainer>
                      {matchingSearchIconKeys.map((iconKey) => (
                        <IconPickerIcon
                          key={iconKey}
                          iconKey={iconKey}
                          onSelect={() => {
                            onChange({ iconKey, Icon: getIcon(iconKey) });
                            closeDropdown(dropdownId);
                          }}
                          selectedIconKey={selectedIconKey}
                          Icon={getIcon(iconKey)}
                          focusedIconKey={focusedIconKey}
                          color={selectedColor}
                        />
                      ))}
                    </StyledMenuIconItemsContainer>
                    <IconPickerScrollEffect
                      sentinelId="icon-picker-scroll-sentinel"
                      dropdownId={dropdownId}
                    />
                    <StyledLoadingMore id="icon-picker-scroll-sentinel">
                      {isLoadingMore ? t`Loading more...` : null}
                    </StyledLoadingMore>
                  </DropdownMenuItemsContainer>
                </div>
              </SelectableList>
            </LegacyDropdownContent>
          </ScrollWrapper>
        }
        onClickOutside={onClickOutside}
        onClose={() => {
          onClose?.();
          setSearchString('');
          resetIconPickerVisibleCount();
        }}
        onOpen={onOpen}
      />
    </div>
  );
};
