import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/dropdown/scopes/DropdownScope';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { DropdownMenuSkeletonItem } from '../relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { IconPickerHotkeyScope } from '../Types/IconPickerHotkeyScope';

type IconPickerProps = {
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
};

const StyledContainer = styled.div`
  width: 176px;
`;

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
  onChange,
  selectedIconKey,
  onClickOutside,
  onClose,
  onOpen,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [icons, setIcons] = useState<Record<string, IconComponent>>({});

  const { closeDropdown } = useDropdown({ dropdownScopeId: 'icon-picker' });

  useEffect(() => {
    import('../constants/icons').then((lazyLoadedIcons) => {
      setIcons(lazyLoadedIcons);
      setIsLoading(false);
    });
  }, []);

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
      <DropdownMenu
        dropdownHotkeyScope={{ scope: IconPickerHotkeyScope.IconPicker }}
        clickableComponent={
          <IconButton
            Icon={selectedIconKey ? icons[selectedIconKey] : undefined}
            variant="secondary"
          />
        }
        dropdownComponents={
          <StyledContainer>
            <DropdownMenuSearchInput
              placeholder="Search icon"
              autoFocus
              onChange={(event) => setSearchString(event.target.value)}
            />
            <StyledDropdownMenuSeparator />
            <DropdownMenuItemsContainer>
              {isLoading ? (
                <DropdownMenuSkeletonItem />
              ) : (
                <StyledMenuIconItemsContainer>
                  {iconKeys.map((iconKey) => (
                    <StyledLightIconButton
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
          </StyledContainer>
        }
        onClickOutside={onClickOutside}
        onClose={onClose}
        onOpen={onOpen}
      ></DropdownMenu>
    </DropdownScope>
  );
};
