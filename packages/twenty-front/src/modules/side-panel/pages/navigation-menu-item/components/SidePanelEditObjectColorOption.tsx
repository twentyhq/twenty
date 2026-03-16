import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { IconColorSwatch } from 'twenty-ui/display';
import {
  DEFAULT_COLOR_LABELS,
  MenuItemSelectColor,
} from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const OBJECT_COLOR_DROPDOWN_ID = 'object-metadata-color';

const StyledMenuStyleText = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 13px;
`;

type SidePanelEditObjectColorOptionProps = {
  objectMetadataId: string;
  color: ThemeColor;
};

export const SidePanelEditObjectColorOption = ({
  objectMetadataId,
  color,
}: SidePanelEditObjectColorOptionProps) => {
  const { t } = useLingui();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { closeDropdown } = useCloseDropdown();

  const [searchValue, setSearchValue] = useState('');
  const themeColor = color ?? 'gray';
  const colorLabel = DEFAULT_COLOR_LABELS[themeColor] ?? capitalize(themeColor);

  const query = searchValue.trim().toLowerCase();

  const filteredColorNames = isNonEmptyString(query)
    ? MAIN_COLOR_NAMES.filter(
        (colorName) =>
          colorName.toLowerCase().includes(query) ||
          (DEFAULT_COLOR_LABELS[colorName] ?? '').toLowerCase().includes(query),
      )
    : MAIN_COLOR_NAMES;

  const handleSelectColor = (selectedColor: ThemeColor) => {
    updateOneObjectMetadataItem({
      idToUpdate: objectMetadataId,
      updatePayload: { color: selectedColor },
    });
    closeDropdown(OBJECT_COLOR_DROPDOWN_ID);
  };

  return (
    <CommandMenuItemDropdown
      id="edit-object-metadata-color"
      label={t`Color`}
      Icon={IconColorSwatch}
      dropdownId={OBJECT_COLOR_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      RightComponent={<StyledMenuStyleText>{colorLabel}</StyledMenuStyleText>}
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuSearchInput
            placeholder={t`Search colors...`}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer hasMaxHeight>
            {filteredColorNames.map((colorName) => (
              <MenuItemSelectColor
                key={colorName}
                onClick={() => handleSelectColor(colorName)}
                color={colorName}
                selected={colorName === themeColor}
                colorLabels={DEFAULT_COLOR_LABELS}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
