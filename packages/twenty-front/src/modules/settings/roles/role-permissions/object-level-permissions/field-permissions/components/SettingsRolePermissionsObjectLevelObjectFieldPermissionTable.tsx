import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { StyledObjectFieldTableRow } from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow';
import { SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { OrderBy } from '@/types/OrderBy';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { H2Title, IconEye, IconPencil, IconSearch } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';
import { turnOrderByIntoSort } from '~/utils/turnOrderByIntoSort';

export const SETTINGS_ROLE_PERMISSION_OBJECT_LEVEL_FIELD_PERMISSION_TABLE_ID =
  'settings-role-permissions-object-level-object-field-permission';

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export type SettingsRolePermissionsObjectLevelObjectFieldPermissionTableProps =
  {
    objectMetadataItem: ObjectMetadataItem;
    roleId: string;
  };

export const SettingsRolePermissionsObjectLevelObjectFieldPermissionTable = ({
  objectMetadataItem,
  roleId,
}: SettingsRolePermissionsObjectLevelObjectFieldPermissionTableProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedFieldByTable = useRecoilValue(
    sortedFieldByTableFamilyState({
      tableId: SETTINGS_ROLE_PERMISSION_OBJECT_LEVEL_FIELD_PERMISSION_TABLE_ID,
    }),
  );

  const searchedFields = objectMetadataItem.fields.filter((fieldMetadataItem) =>
    fieldMetadataItem.label
      .toLocaleLowerCase()
      .includes(searchTerm.toLocaleLowerCase()),
  );

  const restrictableFieldMetadataItems = [
    ...searchedFields.filter(filterUserFacingFieldMetadataItems),
  ].sort(
    sortByProperty(
      'label',
      turnOrderByIntoSort(
        sortedFieldByTable?.orderBy ?? ('AscNullsFirst' satisfies OrderBy),
      ),
    ),
  );

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const fieldPermissions =
    settingsDraftRole.fieldPermissions?.filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataItem.id,
    ) ?? [];

  const { cannotAllowFieldReadRestrict, cannotAllowFieldUpdateRestrict } =
    useObjectPermissionDerivedStates({
      roleId,
      objectMetadataItemId: objectMetadataItem.id,
    });

  return (
    <Section>
      <H2Title
        title={t`Fields Permissions`}
        description={t`Ability to interact with this object's fields.`}
      />
      <StyledSearchInput
        instanceId="object-field-table-search"
        LeftIcon={IconSearch}
        placeholder={t`Search a field...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledObjectFieldTableRow>
          <SortableTableHeader
            fieldName={'label'}
            label={t`Name`}
            tableId={
              SETTINGS_ROLE_PERMISSION_OBJECT_LEVEL_FIELD_PERMISSION_TABLE_ID
            }
            initialSort={{ fieldName: 'label', orderBy: 'AscNullsFirst' }}
          />
          <TableHeader>
            <TableHeaderText>{t`Data type`}</TableHeaderText>
          </TableHeader>
          {cannotAllowFieldReadRestrict ? (
            <TableHeader></TableHeader>
          ) : (
            <TableHeader align="center">
              <TableHeaderText>{t`See`}</TableHeaderText>
              <IconEye
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.md}
              />
            </TableHeader>
          )}
          {cannotAllowFieldUpdateRestrict ? (
            <TableHeader></TableHeader>
          ) : (
            <TableHeader>
              <TableHeaderText>{t`Edit`}</TableHeaderText>
              <IconPencil
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.md}
              />
            </TableHeader>
          )}
        </StyledObjectFieldTableRow>
        <SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
        {isNonEmptyArray(restrictableFieldMetadataItems) &&
          restrictableFieldMetadataItems.map((fieldMetadataItem) => (
            <SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow
              key={fieldMetadataItem.id}
              fieldMetadataItem={fieldMetadataItem}
              fieldPermissions={fieldPermissions}
              objectMetadataItem={objectMetadataItem}
              roleId={roleId}
            />
          ))}
      </Table>
    </Section>
  );
};
