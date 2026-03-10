import { isDefined } from 'twenty-shared/utils';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React, { type ReactNode, useCallback, useMemo, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { IconPickerScrollEffect } from '@/ui/input/effect-components/IconPickerScrollEffect';
import {
  ICON_PICKER_DEFAULT_VISIBLE_COUNT,
  iconPickerVisibleCountState,
} from '@/ui/input/states/iconPickerVisibleCountState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { IconApps, type IconComponent, useIcons } from 'twenty-ui/display';
import {
  IconButton,
  type IconButtonSize,
  type IconButtonVariant,
  LightIconButton,
} from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type IconPickerProps = {
  disabled?: boolean;
  dropdownId?: string;
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  variant?: IconButtonVariant;
  className?: string;
  size?: IconButtonSize;
  clickableComponent?: ReactNode;
  dropdownWidth?: number;
  dropdownOffset?: DropdownOffset;
  maxIconsVisible?: number;
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

type StyledLightIconButtonProps = React.ComponentProps<
  typeof LightIconButton
> & {
  isSelected?: boolean;
  isFocused?: boolean;
};

const StyledLightIconButton = ({
  isSelected,
  isFocused,
  className,
  'aria-label': ariaLabel,
  size,
  title,
  Icon,
  onClick,
  testId,
  active,
  accent,
  disabled,
  focus,
}: StyledLightIconButtonProps) => (
  <LightIconButton
    aria-label={ariaLabel}
    size={size}
    title={title}
    Icon={Icon}
    onClick={onClick}
    testId={testId}
    active={active}
    accent={accent}
    disabled={disabled}
    focus={focus}
    className={`${className ?? ''} ${isSelected ? selectedIconButtonStyle : isFocused ? focusedIconButtonStyle : ''}`}
  />
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
};

const IconPickerIcon = ({
  iconKey,
  onSelect,
  selectedIconKey,
  Icon,
  focusedIconKey,
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
          size="medium"
          title={iconKey}
          isSelected={iconKey === selectedIconKey || !!selectedItemId}
          isFocused={iconKey === focusedIconKey}
          Icon={Icon}
          onClick={onSelect}
        />
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
  variant = 'secondary',
  className,
  size = 'medium',
  clickableComponent,
  dropdownWidth,
  dropdownOffset,
  maxIconsVisible,
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

  const icon = selectedIconKey ? getIcon(selectedIconKey) : IconApps;

  const selectableListInstanceId = 'icon-list';

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
        clickableComponent={
          clickableComponent ?? (
            <IconButton
              ariaLabel={t`Click to select icon ${iconAriaLabel}`}
              disabled={disabled}
              Icon={icon}
              variant={variant}
              size={size}
            />
          )
        }
        dropdownComponents={
          <ScrollWrapper componentInstanceId="icon-picker-scroll">
            <DropdownContent
              widthInPixels={
                dropdownWidth || ICON_PICKER_DROPDOWN_CONTENT_WIDTH
              }
            >
              <SelectableList
                selectableListInstanceId={selectableListInstanceId}
                selectableItemIdMatrix={iconKeys2d}
                focusId={dropdownId}
              >
                <DropdownMenuSearchInput
                  placeholder={t`Search icon`}
                  autoFocus
                  onChange={(event) => {
                    setSearchString(event.target.value);
                  }}
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
            </DropdownContent>
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
