import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  FIELD_PERMISSION_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow,
} from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow';
import { useFieldPermissionTableColumns } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useFieldPermissionTableColumns';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconSearch } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const SETTINGS_ROLE_PERMISSION_OBJECT_LEVEL_FIELD_PERMISSION_TABLE_ID =
  'settings-role-permissions-object-level-object-field-permission';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export type SettingsRolePermissionsObjectLevelObjectFieldPermissionTableProps =
  {
    objectMetadataItem: EnrichedObjectMetadataItem;
    roleId: string;
  };

export const SettingsRolePermissionsObjectLevelObjectFieldPermissionTable = ({
  objectMetadataItem,
  roleId,
}: SettingsRolePermissionsObjectLevelObjectFieldPermissionTableProps) => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const tableId = useWorkspaceSurfaceScopedComponentInstanceId(
    SETTINGS_ROLE_PERMISSION_OBJECT_LEVEL_FIELD_PERMISSION_TABLE_ID,
  );

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    {
      tableId,
    },
  );

  const searchedFields = objectMetadataItem.fields.filter((fieldMetadataItem) =>
    fieldMetadataItem.label
      .toLocaleLowerCase()
      .includes(searchTerm.toLocaleLowerCase()),
  );

  const restrictableFieldMetadataItems = [
    ...searchedFields.filter(filterUserFacingFieldMetadataItems),
  ].sort(sortByProperty('label', sortedFieldByTable?.direction ?? 'asc'));

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const fieldPermissions =
    settingsDraftRole.fieldPermissions?.filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataItem.id,
    ) ?? [];

  const { shouldShowSeeColumn, shouldShowUpdateColumn } =
    useFieldPermissionTableColumns({
      roleId,
      objectMetadataItemId: objectMetadataItem.id,
    });

  return (
    <Section>
      <H2Title
        title={t`Fields Permissions`}
        description={t`Ability to interact with this object's fields.`}
      />
      <StyledSearchInputContainer>
        <SettingsTextInput
          instanceId="object-field-table-search"
          LeftIcon={IconSearch}
          placeholder={t`Search a field...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow
          gridTemplateColumns={FIELD_PERMISSION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
        >
          <SortableTableHeader
            fieldName="label"
            label={t`Name`}
            tableId={
              SETTINGS_ROLE_PERMISSION_OBJECT_LEVEL_FIELD_PERMISSION_TABLE_ID
            }
            initialSort={{ fieldName: 'label', direction: 'asc' }}
          />
          <TableHeader>
            <TableHeaderText>{t`Data type`}</TableHeaderText>
          </TableHeader>
          <>
            {!shouldShowSeeColumn && <TableHeader />}
            {!shouldShowUpdateColumn && <TableHeader />}
            {shouldShowSeeColumn && (
              <TableHeader>
                <TableHeaderText>{t`See`}</TableHeaderText>
              </TableHeader>
            )}
            {shouldShowUpdateColumn && (
              <TableHeader>
                <TableHeaderText>{t`Edit`}</TableHeaderText>
              </TableHeader>
            )}
          </>
        </TableRow>
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
              isLabelIdentifier={
                objectMetadataItem.labelIdentifierFieldMetadataId ===
                fieldMetadataItem.id
              }
            />
          ))}
      </Table>
    </Section>
  );
};
