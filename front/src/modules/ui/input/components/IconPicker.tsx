import { useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';

import { IconButton, IconButtonVariant } from '../button/components/IconButton';
import { LightIconButton } from '../button/components/LightIconButton';
import { IconApps } from '../constants/icons';
import { useLazyLoadIcons } from '../hooks/useLazyLoadIcons';
import { DropdownMenuSkeletonItem } from '../relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { IconPickerHotkeyScope } from '../types/IconPickerHotkeyScope';

type IconPickerProps = {
  disabled?: boolean;
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  variant?: IconButtonVariant;
};

const StyledMenuIconItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const StyledLightIconButton = styled(LightIconButton)<{ isSelected?: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
`;

const convertIconKeyToLabel = (iconKey: string) =>
  iconKey.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

export const IconPicker = ({
  disabled,
  onChange,
  selectedIconKey,
  onClickOutside,
  onClose,
  onOpen,
  variant = 'secondary',
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');

  const { closeDropdown } = useDropdown({ dropdownScopeId: 'icon-picker' });

  const { icons, isLoadingIcons: isLoading } = useLazyLoadIcons();

  const iconKeys = useMemo(() => {
    const filteredIconKeys = Object.keys(icons).filter(
      (iconKey) =>
        iconKey !== selectedIconKey &&
        (!searchString ||
          [iconKey, convertIconKeyToLabel(iconKey)].some((label) =>
            label.toLowerCase().includes(searchString.toLowerCase()),
          )),
    );

    return (
      selectedIconKey
        ? [selectedIconKey, ...filteredIconKeys]
        : filteredIconKeys
    ).slice(0, 25);
  }, [icons, searchString, selectedIconKey]);

  return (
    <DropdownScope dropdownScopeId="icon-picker">
      <Dropdown
        dropdownHotkeyScope={{ scope: IconPickerHotkeyScope.IconPicker }}
        clickableComponent={
          <IconButton
            disabled={disabled}
            Icon={selectedIconKey ? icons[selectedIconKey] : IconApps}
            variant={variant}
          />
        }
        dropdownComponents={
          <DropdownMenu width={168}>
            <DropdownMenuSearchInput
              placeholder="Search icon"
              autoFocus
              onChange={(event) => setSearchString(event.target.value)}
            />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer>
              {isLoading ? (
                <DropdownMenuSkeletonItem />
              ) : (
                <StyledMenuIconItemsContainer>
                  {iconKeys.map((iconKey) => (
                    <StyledLightIconButton
                      key={iconKey}
                      aria-label={convertIconKeyToLabel(iconKey)}
                      isSelected={selectedIconKey === iconKey}
                      size="medium"
                      Icon={icons[iconKey]}
                      onClick={() => {
                        onChange({ iconKey, Icon: icons[iconKey] });
                        closeDropdown();
                      }}
                    />
                  ))}
                </StyledMenuIconItemsContainer>
              )}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        onClickOutside={onClickOutside}
        onClose={() => {
          onClose?.();
          setSearchString('');
        }}
        onOpen={onOpen}
      />
    </DropdownScope>
  );
};
