import {
  IconArchive,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTextSize,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useTranslation } from 'react-i18next';

type SettingsObjectFieldActiveActionDropdownProps = {
  isCustomField?: boolean;
  onDeactivate?: () => void;
  onEdit: () => void;
  onSetAsLabelIdentifier?: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldActiveActionDropdown = ({
  isCustomField,
  onDeactivate,
  onEdit,
  onSetAsLabelIdentifier,
  scopeKey,
}: SettingsObjectFieldActiveActionDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const { t } = useTranslation();

  const handleEdit = () => {
    onEdit();
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
      dropdownMenuWidth={160}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            text={isCustomField ? t('edit') : t('view')}
            LeftIcon={isCustomField ? IconPencil : IconEye}
            onClick={handleEdit}
          />
          {!!onSetAsLabelIdentifier && (
            <MenuItem
              text={t('setAsRecordText')}
              LeftIcon={IconTextSize}
              onClick={handleSetAsLabelIdentifier}
            />
          )}
          {!!onDeactivate && (
            <MenuItem
              text={t('deactivate')}
              LeftIcon={IconArchive}
              onClick={handleDeactivate}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
