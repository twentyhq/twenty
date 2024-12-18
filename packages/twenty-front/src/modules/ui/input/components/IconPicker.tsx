import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconApps,
  IconButton,
  IconButtonVariant,
  IconComponent,
  LightIconButton,
  useIcons,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

import { IconPickerHotkeyScope } from '../types/IconPickerHotkeyScope';

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
  const { isSelectedItemIdSelector } = useSelectableList();

  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(iconKey));

  return (
    <StyledLightIconButton
      key={iconKey}
      aria-label={convertIconKeyToLabel(iconKey)}
      size="medium"
      title={iconKey}
      isSelected={iconKey === selectedIconKey || isSelectedItemId}
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
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

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
        ].slice(0, 25)
      : filteredAndSortedIconKeys.slice(0, 25);
  }, [icons, searchString, selectedIconKey]);

  const iconKeys2d = useMemo(
    () => arrayToChunks(matchingSearchIconKeys.slice(), 5),
    [matchingSearchIconKeys],
  );

  const icon = selectedIconKey ? getIcon(selectedIconKey) : IconApps;

  return (
    <div className={className}>
      <Dropdown
        dropdownId={dropdownId}
        dropdownHotkeyScope={{ scope: IconPickerHotkeyScope.IconPicker }}
        clickableComponent={
          <IconButton
            ariaLabel={`Click to select icon ${
              selectedIconKey
                ? `(selected: ${selectedIconKey})`
                : `(no icon selected)`
            }`}
            disabled={disabled}
            Icon={icon}
            variant={variant}
          />
        }
        dropdownMenuWidth={176}
        dropdownComponents={
          <SelectableList
            selectableListId="icon-list"
            selectableItemIdMatrix={iconKeys2d}
            hotkeyScope={IconPickerHotkeyScope.IconPicker}
            onEnter={(iconKey) => {
              onChange({ iconKey, Icon: getIcon(iconKey) });
              closeDropdown();
            }}
          >
            <DropdownMenu width={176}>
              <DropdownMenuSearchInput
                placeholder="Search icon"
                autoFocus
                onChange={(event) => {
                  setSearchString(event.target.value);
                }}
              />
              <DropdownMenuSeparator />
              <div
                onMouseEnter={() => {
                  setHotkeyScopeAndMemorizePreviousScope(
                    IconPickerHotkeyScope.IconPicker,
                  );
                }}
                onMouseLeave={goBackToPreviousHotkeyScope}
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
            </DropdownMenu>
          </SelectableList>
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
