import styled from '@emotion/styled';
import { type ReactNode, useMemo, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { IconApps, type IconComponent, useIcons } from 'twenty-ui/display';
import {
  IconButton,
  type IconButtonSize,
  type IconButtonVariant,
  LightIconButton,
} from 'twenty-ui/input';
import { IconPickerScrollEffect } from '@/ui/input/hooks/IconPickerScrollEffect';
import { iconPickerVisibleCountState } from '@/ui/input/states/iconPickerVisibleCountState';

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
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledLightIconButton = styled(LightIconButton)<{
  isSelected?: boolean;
  isFocused?: boolean;
}>`
  background: ${({ theme, isSelected, isFocused }) =>
    isSelected
      ? theme.background.transparent.medium
      : isFocused
        ? theme.background.transparent.light
        : 'transparent'};
`;

const StyledLoadingMore = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  font-size: 14px;
`;

const StyledMatrixItem = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const convertIconKeyToLabel = (iconKey: string) =>
  iconKey.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

type IconPickerIconProps = {
  iconKey: string;
  onClick: () => void;
  selectedIconKey?: string;
  Icon: IconComponent;
  focusedIconKey?: string;
};

const IconPickerIcon = ({
  iconKey,
  onClick,
  selectedIconKey,
  Icon,
  focusedIconKey,
}: IconPickerIconProps) => {
  const isSelectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    iconKey,
  );

  return (
    <StyledMatrixItem>
      <SelectableListItem itemId={iconKey} onEnter={onClick}>
        <StyledLightIconButton
          key={iconKey}
          aria-label={convertIconKeyToLabel(iconKey)}
          size="medium"
          title={iconKey}
          isSelected={iconKey === selectedIconKey || !!isSelectedItemId}
          isFocused={iconKey === focusedIconKey}
          Icon={Icon}
          onClick={onClick}
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

  const iconPickerVisibleCount =
    useRecoilValue(iconPickerVisibleCountState(dropdownId)) ?? maxIconsVisible;

  const resetIconPickerVisibleCount = useResetRecoilState(
    iconPickerVisibleCountState(dropdownId),
  );

  const { getIcons, getIcon } = useIcons();
  const icons = getIcons();

  const totalMatchingIconsCount = useMemo(() => {
    if (!icons) return 0;

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
      selectedIconKey && filteredAndSortedIconKeys.includes(selectedIconKey);

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
    useRecoilComponentValue(
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
          clickableComponent || (
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
                          onClick={() => {
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
