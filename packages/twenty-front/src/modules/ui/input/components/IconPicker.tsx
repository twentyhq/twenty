import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconApps } from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { arrayToChunks } from '~/utils/array/array-to-chunks';

import { IconButton, IconButtonVariant } from '../button/components/IconButton';
import { LightIconButton } from '../button/components/LightIconButton';
import { IconPickerHotkeyScope } from '../types/IconPickerHotkeyScope';

type IconPickerProps = {
  disabled?: boolean;
  dropdownScopeId?: string;
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
  const { isSelectedItemIdFamilyState } = useSelectableList();

  const isSelectedItemId = useRecoilValue(isSelectedItemIdFamilyState(iconKey));

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
  dropdownScopeId = 'icon-picker',
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

  const { closeDropdown } = useDropdown(dropdownScopeId);

  const { getIcons, getIcon } = useIcons();
  const icons = getIcons();

  const iconKeys = useMemo(() => {
    const filteredIconKeys = icons
      ? Object.keys(icons).filter((iconKey) => {
          return (
            iconKey !== selectedIconKey &&
            (!searchString ||
              [iconKey, convertIconKeyToLabel(iconKey)].some((label) =>
                label.toLowerCase().includes(searchString.toLowerCase()),
              ))
          );
        })
      : [];

    return (
      selectedIconKey
        ? [selectedIconKey, ...filteredIconKeys]
        : filteredIconKeys
    ).slice(0, 25);
  }, [icons, searchString, selectedIconKey]);

  const iconKeys2d = useMemo(
    () => arrayToChunks(iconKeys.slice(), 5),
    [iconKeys],
  );

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <div className={className}>
        <Dropdown
          dropdownHotkeyScope={{ scope: IconPickerHotkeyScope.IconPicker }}
          clickableComponent={
            <IconButton
              disabled={disabled}
              Icon={selectedIconKey ? getIcon(selectedIconKey) : IconApps}
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
                  onChange={(event) => setSearchString(event.target.value)}
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
                      {iconKeys.map((iconKey) => (
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
    </DropdownScope>
  );
};
