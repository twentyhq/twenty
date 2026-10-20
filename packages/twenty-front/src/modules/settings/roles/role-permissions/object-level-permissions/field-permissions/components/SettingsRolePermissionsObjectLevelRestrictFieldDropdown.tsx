import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { getFieldPermissionFromRestriction } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getFieldPermissionFromRestriction';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus, useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { v4 } from 'uuid';

const DROPDOWN_ID = 'settings-role-permissions-restrict-field';

type SettingsRolePermissionsObjectLevelRestrictFieldDropdownProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  restrictableFieldMetadataItems: FieldMetadataItem[];
  canRestrictUpdate: boolean;
  disabled: boolean;
};

export const SettingsRolePermissionsObjectLevelRestrictFieldDropdown = ({
  roleId,
  objectMetadataItem,
  restrictableFieldMetadataItems,
  canRestrictUpdate,
  disabled,
}: SettingsRolePermissionsObjectLevelRestrictFieldDropdownProps) => {
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const searchedFieldMetadataItems = restrictableFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.label
        .toLocaleLowerCase()
        .includes(searchInput.toLocaleLowerCase()),
  );

  const handleSelectFieldMetadataItem = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    const isLabelIdentifier =
      objectMetadataItem.labelIdentifierFieldMetadataId ===
      fieldMetadataItem.id;

    upsertFieldPermissionInDraftRole(
      getFieldPermissionFromRestriction(
        {
          id: v4(),
          roleId,
          objectMetadataId: objectMetadataItem.id,
          fieldMetadataId: fieldMetadataItem.id,
        },
        canRestrictUpdate || isLabelIdentifier ? 'CANNOT_EDIT' : 'CANNOT_SEE',
      ),
    );
  };

  return (
    <DropdownRoot dropdownId={DROPDOWN_ID} type="picker">
      <Dropdown.Trigger
        render={
          <Button
            startIcon={<IconPlus />}
            size="sm"
            variant="outline"
            disabled={disabled}
          >{t`Restrict a field`}</Button>
        }
      />
      <DropdownContent align="end" aria-label={t`Select a field`}>
        <Dropdown.Search
          value={searchInput}
          onValueChange={setSearchInput}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
        />
        <Dropdown.Section>
          {searchedFieldMetadataItems.map((fieldMetadataItem) => (
            <Dropdown.OptionItem
              key={fieldMetadataItem.id}
              startIcon={
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              }
              closeOnSelect
              onSelect={() => handleSelectFieldMetadataItem(fieldMetadataItem)}
            >
              {fieldMetadataItem.label}
            </Dropdown.OptionItem>
          ))}
          {!isNonEmptyArray(searchedFieldMetadataItems) && (
            <Dropdown.Empty>{t`No fields found`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
