import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

import { useState } from 'react';
import {
  IconArchive,
  IconDotsVertical,
  IconPencil,
  IconTextSize,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsServiceCenterFieldActionDropdownProps = {
  modalMessage: {
    title: string;
    subtitle: string;
  };
  onDelete?: () => void;
  onDeactivate?: () => void;
  onEdit: (action: ActionType) => void;
  onSetAsLabelIdentifier?: () => void;
  scopeKey: string;
  isActive?: boolean;
};

export type ActionType = 'Edit' | 'View';

export const SettingsServiceCenterFieldActionDropdown = ({
  modalMessage,
  onDelete,
  onDeactivate,
  onEdit,
  onSetAsLabelIdentifier,
  scopeKey,
  isActive,
}: SettingsServiceCenterFieldActionDropdownProps) => {
  // const { t } = useTranslation();

  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (action: ActionType) => {
    onEdit(action);
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete?.();
    setIsModalOpen(false);
    closeDropdown();
  };

  const handleDeactivate = () => {
    onDeactivate?.();
    setIsModalOpen(false);
    closeDropdown();
  };

  const handleSetAsLabelIdentifier = () => {
    onSetAsLabelIdentifier?.();
    closeDropdown();
  };

  return (
    <>
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
          <DropdownMenu width="100%">
            <DropdownMenuItemsContainer>
              <MenuItem
                text={'Edit'}
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
              {!!onDelete && (
                <MenuItem
                  text={'Delete'}
                  LeftIcon={IconArchive}
                  onClick={() => setIsModalOpen(true)}
                />
              )}
              {!!onDeactivate && (
                <MenuItem
                  text={isActive ? 'Deactivate' : 'Reactivate'}
                  LeftIcon={IconArchive}
                  onClick={() => setIsModalOpen(true)}
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
        title={modalMessage.title}
        subtitle={modalMessage.subtitle}
        onConfirmClick={onDelete ? handleDelete : handleDeactivate}
        confirmButtonText="Continue"
      />
    </>
  );
};
