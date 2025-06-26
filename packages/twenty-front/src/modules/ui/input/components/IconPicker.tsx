import styled from '@emotion/styled';
import { ReactNode, useMemo, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { useSelectableListListenToEnterHotkeyOnItem } from '@/ui/layout/selectable-list/hooks/useSelectableListListenToEnterHotkeyOnItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { IconApps, IconComponent, useIcons } from 'twenty-ui/display';
import {
  IconButton,
  IconButtonSize,
  IconButtonVariant,
  LightIconButton,
} from 'twenty-ui/input';
import { IconPickerHotkeyScope } from '../types/IconPickerHotkeyScope';
import { DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';

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

const StyledLightIconButton = styled(LightIconButton)<{ isSelected?: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.transparent.medium : 'transparent'};
`;

const convertIconKeyToLabel = (iconKey: string) =>
  iconKey.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

type IconPickerIconProps = {
  iconKey: string;
  onClick: () => void;
  selectedIconKey?: string;
  Icon: IconComponent;
};

const IconPickerIcon = ({
  iconKey,
  onClick,
  selectedIconKey,
  Icon,
}: IconPickerIconProps) => {
  const isSelectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    iconKey,
  );

  useSelectableListListenToEnterHotkeyOnItem({
    focusId: iconKey,
    itemId: iconKey,
    onEnter: onClick,
    hotkeyScope: DropdownHotkeyScope.Dropdown,
  });

  return (
    <StyledLightIconButton
      key={iconKey}
      aria-label={convertIconKeyToLabel(iconKey)}
      size="medium"
      title={iconKey}
      isSelected={iconKey === selectedIconKey || !!isSelectedItemId}
      Icon={Icon}
      onClick={onClick}
    />
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
  maxIconsVisible = 25,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const [isMouseInsideIconList, setIsMouseInsideIconList] = useState(false);

  const handleMouseEnter = () => {
    if (!isMouseInsideIconList) {
      setIsMouseInsideIconList(true);
      setHotkeyScopeAndMemorizePreviousScope({
        scope: IconPickerHotkeyScope.IconPicker,
      });
    }
  };

  const handleMouseLeave = () => {
    if (isMouseInsideIconList) {
      setIsMouseInsideIconList(false);
      goBackToPreviousHotkeyScope();
    }
  };

  const { closeDropdown } = useDropdown(dropdownId);

  const { getIcons, getIcon } = useIcons();
  const icons = getIcons();
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
        ].slice(0, maxIconsVisible)
      : filteredAndSortedIconKeys.slice(0, maxIconsVisible);
  }, [icons, searchString, selectedIconKey, maxIconsVisible]);

  const iconKeys2d = useMemo(
    () => arrayToChunks(matchingSearchIconKeys.slice(), 5),
    [matchingSearchIconKeys],
  );

  const icon = selectedIconKey ? getIcon(selectedIconKey) : IconApps;

  return (
    <div className={className}>
      <Dropdown
        dropdownId={dropdownId}
        dropdownOffset={dropdownOffset}
        clickableComponent={
          clickableComponent || (
            <IconButton
              ariaLabel={`Click to select icon ${
                selectedIconKey
                  ? `(selected: ${selectedIconKey})`
                  : `(no icon selected)`
              }`}
              disabled={disabled}
              Icon={icon}
              variant={variant}
              size={size}
            />
          )
        }
        dropdownComponents={
          <DropdownContent
            widthInPixels={dropdownWidth || ICON_PICKER_DROPDOWN_CONTENT_WIDTH}
          >
            <SelectableList
              selectableListInstanceId="icon-list"
              selectableItemIdMatrix={iconKeys2d}
              focusId={dropdownId}
              hotkeyScope={DropdownHotkeyScope.Dropdown}
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
                <DropdownMenuItemsContainer>
                  <StyledMenuIconItemsContainer>
                    {matchingSearchIconKeys.map((iconKey) => (
                      <IconPickerIcon
                        key={iconKey}
                        iconKey={iconKey}
                        onClick={() => {
                          onChange({ iconKey, Icon: getIcon(iconKey) });
                          closeDropdown();
                        }}
                        selectedIconKey={selectedIconKey}
                        Icon={getIcon(iconKey)}
                      />
                    ))}
                  </StyledMenuIconItemsContainer>
                </DropdownMenuItemsContainer>
              </div>
            </SelectableList>
          </DropdownContent>
        }
        onClickOutside={onClickOutside}
        onClose={() => {
          onClose?.();
          setSearchString('');
        }}
        onOpen={onOpen}
      />
    </div>
  );
};
