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
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsObjectFieldInactiveActionDropdownProps = {
  isCustomField?: boolean;
  isSystemField?: boolean;
  fieldType?: FieldMetadataType;
  fieldMetadataItemId: string;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readonly?: boolean;
};

export const SettingsObjectFieldInactiveActionDropdown = ({
  fieldMetadataItemId,
  onActivate,
  readonly = false,
  onDelete,
  onEdit,
  isCustomField,
  isSystemField,
}: SettingsObjectFieldInactiveActionDropdownProps) => {
  const isDeletable = isCustomField && !isSystemField;

  return (
    <DropdownRoot
      type="menu"
      dropdownId={`${fieldMetadataItemId}-settings-field-disabled-action-dropdown`}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Inactive Field Options`}
            emphasis="subtle"
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent align="end" width={GenericDropdownContentWidth.Narrow}>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={isCustomField ? <IconPencil /> : <IconEye />}
            onClick={onEdit}
          >
            {isCustomField && !readonly ? t`Edit` : t`View`}
          </Dropdown.ActionItem>
          {!readonly && (
            <Dropdown.ActionItem
              startIcon={<IconArchiveOff />}
              onClick={onActivate}
            >{t`Activate`}</Dropdown.ActionItem>
          )}
          {isDeletable && !readonly && (
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={onDelete}
            >{t`Delete`}</Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
