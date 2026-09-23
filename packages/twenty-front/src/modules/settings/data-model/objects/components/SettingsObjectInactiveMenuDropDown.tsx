import { t } from '@lingui/core/macro';
import {
  IconArchiveOff,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const INACTIVE_OBJECT_MENU_WIDTH = 160;

type SettingsObjectInactiveMenuDropDownProps = {
  isCustomObject: boolean;
  objectMetadataItemNamePlural: string;
  onActivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isReadOnly?: boolean;
};

export const SettingsObjectInactiveMenuDropDown = ({
  objectMetadataItemNamePlural,
  onActivate,
  onDelete,
  onEdit,
  isCustomObject,
  isReadOnly = false,
}: SettingsObjectInactiveMenuDropDownProps) => {
  const isEditable = isCustomObject && !isReadOnly;

  return (
    <DropdownRoot
      type="menu"
      dropdownId={`${objectMetadataItemNamePlural}-settings-object-inactive-menu-dropdown`}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Inactive Object Options`}
            emphasis="subtle"
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content align="end" width={INACTIVE_OBJECT_MENU_WIDTH}>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={isEditable ? <IconPencil /> : <IconEye />}
            onClick={onEdit}
          >
            {isEditable ? t`Edit` : t`View`}
          </Dropdown.ActionItem>
          {!isReadOnly && (
            <Dropdown.ActionItem
              startIcon={<IconArchiveOff />}
              onClick={onActivate}
            >{t`Activate`}</Dropdown.ActionItem>
          )}
          {isCustomObject && !isReadOnly && (
            <Dropdown.ActionItem
              startIcon={<IconTrash />}
              color="danger"
              onClick={onDelete}
            >{t`Delete`}</Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
