import { useState } from 'react';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { IconArchiveOff, IconDotsVertical, IconTrash } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsRoleFieldDisabledActionDropdownProps = {
  isCustomField?: boolean;
  fieldType?: FieldMetadataType;
  onActivate?: () => void;
  onDelete?: (roleId: string) => void;
  scopeKey: string;
  roleId: string;
};

export const SettingsRoleFieldDisabledActionDropdown = ({
  isCustomField,
  onActivate = () => {},
  onDelete = () => {},
  scopeKey,
  roleId,
}: SettingsRoleFieldDisabledActionDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-disabled-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  const handleDelete = () => {
    setIsModalOpen(true);
    closeDropdown();
  };

  const confirmDelete = () => {
    onDelete(roleId);
    setIsModalOpen(false);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
  };

  const isDeletable = isCustomField;

  return (
    <>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
        }
        dropdownComponents={
          <DropdownMenu width="160px">
            <DropdownMenuItemsContainer>
              <MenuItem
                text="Activate"
                LeftIcon={IconArchiveOff}
                onClick={handleActivate}
              />
              {isDeletable && (
                <MenuItem
                  text="Delete"
                  accent="danger"
                  LeftIcon={IconTrash}
                  onClick={handleDelete}
                />
              )}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: dropdownId,
        }}
      />
      <ConfirmationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title="Delete role"
        subtitle={<>This will permanently delete this role.</>}
        onConfirmClick={confirmDelete}
        deleteButtonText="Continue"
      />
    </>
  );
};
