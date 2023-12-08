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

  const { closeDropdown } = useDropdown({ dropdownScopeId });

  const { icons, isLoadingIcons: isLoading } = useLazyLoadIcons();

  const iconKeys = useMemo(() => {
    const filteredIconKeys = Object.keys(icons).filter((iconKey) => {
      return (
        iconKey !== selectedIconKey &&
        (!searchString ||
          [iconKey, convertIconKeyToLabel(iconKey)].some((label) =>
            label.toLowerCase().includes(searchString.toLowerCase()),
          ))
      );
    });

    return (
      selectedIconKey
        ? [selectedIconKey, ...filteredIconKeys]
        : filteredIconKeys
    ).slice(0, 25);
  }, [icons, searchString, selectedIconKey]);

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <div className={className}>
        <Dropdown
          dropdownHotkeyScope={{ scope: IconPickerHotkeyScope.IconPicker }}
          clickableComponent={
            <IconButton
              disabled={disabled}
              Icon={selectedIconKey ? icons[selectedIconKey] : IconApps}
              variant={variant}
            />
          }
          dropdownMenuWidth={176}
          dropdownComponents={
            <DropdownMenu width={176}>
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
                        title={iconKey}
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
      </div>
    </DropdownScope>
  );
};
