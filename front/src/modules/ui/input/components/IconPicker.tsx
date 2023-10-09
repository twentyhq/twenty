import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { DropdownMenuSkeletonItem } from '../relation-picker/components/skeletons/DropdownMenuSkeletonItem';

type IconPickerProps = {
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
};

const StyledIconPickerDropdownMenu = styled(StyledDropdownMenu)`
  width: 176px;
`;

const StyledMenuIconItemsContainer = styled(DropdownMenuItemsContainer)`
  flex-direction: row;
  flex-wrap: wrap;
  height: auto;
`;

const StyledLightIconButton = styled(LightIconButton)<{ isSelected?: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
`;

const convertIconKeyToLabel = (iconKey: string) =>
  iconKey.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

export const IconPicker = ({ onChange, selectedIconKey }: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [icons, setIcons] = useState<Record<string, IconComponent>>({});

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
    <StyledIconPickerDropdownMenu>
      <DropdownMenuSearchInput
        placeholder="Search icon"
        autoFocus
        onChange={(event) => setSearchString(event.target.value)}
      />
      <StyledDropdownMenuSeparator />
      <StyledMenuIconItemsContainer>
        {isLoading ? (
          <DropdownMenuSkeletonItem />
        ) : (
          iconKeys.map((iconKey) => (
            <StyledLightIconButton
              aria-label={convertIconKeyToLabel(iconKey)}
              isSelected={selectedIconKey === iconKey}
              size="medium"
              Icon={icons[iconKey]}
              onClick={() => onChange({ iconKey, Icon: icons[iconKey] })}
            />
          ))
        )}
      </StyledMenuIconItemsContainer>
    </StyledIconPickerDropdownMenu>
  );
};
