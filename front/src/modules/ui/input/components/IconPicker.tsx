import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { IconButton } from '@/ui/button/components/IconButton';
import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { DropdownMenuSkeletonItem } from '../relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { IconPickerHotkeyScope } from '../Types/IconPickerHotkeyScope';

type IconPickerProps = {
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
  onEnter?: () => void;
  onEscape?: () => void;
};

const StyledContainer = styled.div`
  position: relative;
`;

const StyledIconPickerDropdownMenu = styled(StyledDropdownMenu)`
  position: absolute;
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
  onEnter,
  onEscape,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [icons, setIcons] = useState<Record<string, IconComponent>>({});
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

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

  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(IconPickerHotkeyScope.IconPicker);
  }, [setHotkeyScope]);

  const containerRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      setIconPickerOpen(false);
      onClickOutside?.(event);
    },
    enabled: true,
  });

  useScopedHotkeys(
    Key.Enter,
    () => {
      setIconPickerOpen(false);
      onEnter?.();
    },
    IconPickerHotkeyScope.IconPicker,
    [onEnter],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      setIconPickerOpen(false);
      onEscape?.();
    },
    IconPickerHotkeyScope.IconPicker,
    [onEscape],
  );

  return (
    <StyledContainer ref={containerRef}>
      <IconButton
        Icon={selectedIconKey ? icons[selectedIconKey] : undefined}
        onClick={() => {
          setIconPickerOpen(true);
        }}
        variant="secondary"
      />
      {iconPickerOpen && (
        <StyledIconPickerDropdownMenu>
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
                      setIconPickerOpen(false);
                    }}
                  />
                ))}
              </StyledMenuIconItemsContainer>
            )}
          </DropdownMenuItemsContainer>
        </StyledIconPickerDropdownMenu>
      )}
    </StyledContainer>
  );
};
