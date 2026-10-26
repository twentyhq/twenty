import { useState } from 'react';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { v4 } from 'uuid';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Checkbox, Button } from 'twenty-ui/primitives/input';
import { IconChevronDown } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFields = styled.div`
  max-height: 300px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
`;
const StyledField = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

type RecordPermissionFieldPickerProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  action: 'read' | 'update';
  disabled: boolean;
};
export const RecordPermissionFieldPicker = ({
  roleId,
  objectMetadataItem,
  action,
  disabled,
}: RecordPermissionFieldPickerProps) => {
  const [search, setSearch] = useState('');
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);
  const key = action === 'read' ? 'canReadFieldValue' : 'canUpdateFieldValue';
  const fields = objectMetadataItem.fields
    .filter(filterUserFacingFieldMetadataItems)
    .filter((field) => action !== 'update' || field.isUIEditable !== false);
  const restricted = fields.filter((field) =>
    settingsDraftRole.fieldPermissions?.some(
      (permission) =>
        permission.fieldMetadataId === field.id && permission[key] === false,
    ),
  ).length;
  const update = (fieldId: string, allowed: boolean) => {
    const permission = settingsDraftRole.fieldPermissions?.find(
      (permission) => permission.fieldMetadataId === fieldId,
    );
    upsertFieldPermissionInDraftRole({
      ...permission,
      id: permission?.id ?? v4(),
      roleId,
      objectMetadataId: objectMetadataItem.id,
      fieldMetadataId: fieldId,
      [key]: allowed ? null : false,
      ...(action === 'read' && !allowed ? { canUpdateFieldValue: false } : {}),
      ...(action === 'update' && allowed ? { canReadFieldValue: null } : {}),
    });
  };
  return (
    <DropdownRoot
      dropdownId={`permission-fields-${roleId}-${objectMetadataItem.id}-${action}`}
      type="panel"
    >
      <Dropdown.Trigger
        render={
          <Button
            disabled={disabled}
            variant="ghost"
            size="sm"
            endIcon={<IconChevronDown />}
          />
        }
      >
        {restricted === 0
          ? t`All fields`
          : t`${fields.length - restricted} fields`}
      </Dropdown.Trigger>
      <DropdownContent
        width={250}
        aria-label={action === 'read' ? t`Readable fields` : t`Editable fields`}
      >
        <SettingsTextInput
          instanceId={`permission-field-search-${action}`}
          placeholder={t`Search fields`}
          value={search}
          onChange={setSearch}
        />
        <StyledFields>
          <StyledField>
            {t`All fields`}
            <Checkbox
              checked={restricted === 0}
              disabled={disabled}
              onCheckedChange={(allowed) =>
                fields
                  .filter(
                    (field) =>
                      action !== 'read' ||
                      field.id !==
                        objectMetadataItem.labelIdentifierFieldMetadataId,
                  )
                  .forEach((field) => update(field.id, allowed === true))
              }
            />
          </StyledField>
          {fields
            .filter((field) =>
              field.label.toLowerCase().includes(search.toLowerCase()),
            )
            .map((field) => (
              <StyledField key={field.id}>
                {field.label}
                <Checkbox
                  checked={
                    !settingsDraftRole.fieldPermissions?.some(
                      (permission) =>
                        permission.fieldMetadataId === field.id &&
                        permission[key] === false,
                    )
                  }
                  disabled={
                    disabled ||
                    (action === 'read' &&
                      field.id ===
                        objectMetadataItem.labelIdentifierFieldMetadataId)
                  }
                  onCheckedChange={(allowed) =>
                    update(field.id, allowed === true)
                  }
                />
              </StyledField>
            ))}
        </StyledFields>
      </DropdownContent>
    </DropdownRoot>
  );
};
