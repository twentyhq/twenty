import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
// import { useTranslation } from 'react-i18next';
import {
    IconArchive,
    IconDotsVertical,
    IconPencil,
    IconTextSize
} from 'twenty-ui';
  
  type SettingsRoleFieldActionDropdownProps = {
    isCustomField?: boolean;
    onDeactivate?: () => void;
    onEdit: (action: ActionType) => void;
    onSetAsLabelIdentifier?: () => void;
    scopeKey: string;
  };
  
  export type ActionType = 'Edit' | 'View';
  
  export const SettingsRoleFieldActionDropdown = ({
    isCustomField,
    onDeactivate,
    onEdit,
    onSetAsLabelIdentifier,
    scopeKey,
  }: SettingsRoleFieldActionDropdownProps) => {
    const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;
  
    const { closeDropdown } = useDropdown(dropdownId);
  
    const handleEdit = (action: ActionType) => {
      onEdit(action);
      closeDropdown();
    };
  
    const handleDeactivate = () => {
      onDeactivate?.();
      closeDropdown();
    };
  
    const handleSetAsLabelIdentifier = () => {
      onSetAsLabelIdentifier?.();
      closeDropdown();
    };
  
    // const { t } = useTranslation();
    return (
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <LightIconButton
            aria-label="Active Field Options"
            Icon={IconDotsVertical}
            accent="tertiary"
          />
        }
        dropdownComponents={
          <DropdownMenu width="160px">
            <DropdownMenuItemsContainer>
              <MenuItem
                // text={ t('edit')}
                text="edit"
                LeftIcon={IconPencil}
                onClick={() => handleEdit('Edit')}
              />
              {!!onSetAsLabelIdentifier && (
                <MenuItem
                  text="Set as record text"
                  LeftIcon={IconTextSize}
                  onClick={handleSetAsLabelIdentifier}
                />
              )}
              {!!onDeactivate && (
                <MenuItem
                  text={('deactivate')}
                  LeftIcon={IconArchive}
                  onClick={handleDeactivate}
                />
              )}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: dropdownId,
        }}
      />
    );
  };
  