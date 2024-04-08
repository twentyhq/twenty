import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconArchive, IconDotsVertical, IconPencil } from 'twenty-ui';

import { SettingsSummaryCard } from '@/settings/components/SettingsSummaryCard';
import { SettingsDataModelIsCustomTag } from '@/settings/data-model/objects/SettingsDataModelIsCustomTag';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectSummaryCardProps = {
  iconKey?: string;
  isCustom: boolean;
  name: string;
  onDeactivate: () => void;
  onEdit: () => void;
};

const StyledIsCustomTag = styled(SettingsDataModelIsCustomTag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(6)};
`;

const dropdownId = 'settings-object-edit-about-menu-dropdown';

export const SettingsObjectSummaryCard = ({
  iconKey = '',
  isCustom,
  name,
  onDeactivate,
  onEdit,
}: SettingsObjectSummaryCardProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(iconKey);

  const { closeDropdown } = useDropdown(dropdownId);

  const handleEdit = () => {
    onEdit();
    closeDropdown();
  };

  const handleDeactivate = () => {
    onDeactivate();
    closeDropdown();
  };

  return (
    <SettingsSummaryCard
      title={
        <>
          {!!Icon && <Icon size={theme.icon.size.md} />}
          {name}
        </>
      }
      rightComponent={
        <>
          <StyledIsCustomTag isCustom={isCustom} />
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={
              <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
            }
            dropdownComponents={
              <DropdownMenu width="160px">
                <DropdownMenuItemsContainer>
                  <MenuItem
                    text="Edit"
                    LeftIcon={IconPencil}
                    onClick={handleEdit}
                  />
                  <MenuItem
                    text="Deactivate"
                    LeftIcon={IconArchive}
                    onClick={handleDeactivate}
                  />
                </DropdownMenuItemsContainer>
              </DropdownMenu>
            }
            dropdownHotkeyScope={{
              scope: dropdownId,
            }}
          />
        </>
      }
    />
  );
};
