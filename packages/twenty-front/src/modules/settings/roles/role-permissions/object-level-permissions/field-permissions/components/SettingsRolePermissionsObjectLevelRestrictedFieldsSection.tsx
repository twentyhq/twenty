import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { SettingsRolePermissionsObjectLevelRestrictFieldDropdown } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelRestrictFieldDropdown';
import { SettingsRolePermissionsObjectLevelRestrictedFieldRow } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelRestrictedFieldRow';
import { RESTRICTED_FIELDS_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/constants/RestrictedFieldsTableGridTemplateColumns';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRestrictedFieldsSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelRestrictedFieldsSection = ({
  objectMetadataItem,
  roleId,
}: SettingsRolePermissionsObjectLevelRestrictedFieldsSectionProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { cannotAllowFieldReadRestrict, cannotAllowFieldUpdateRestrict } =
    useObjectPermissionDerivedStates({
      roleId,
      objectMetadataItemId: objectMetadataItem.id,
    });

  const userFacingFieldMetadataItems = objectMetadataItem.fields
    .filter(filterUserFacingFieldMetadataItems)
    .toSorted((firstField, secondField) =>
      firstField.label.localeCompare(secondField.label),
    );

  const restrictedFields = userFacingFieldMetadataItems
    .map((fieldMetadataItem) => {
      const fieldPermission = settingsDraftRole.fieldPermissions?.find(
        (fieldPermissionToFind) =>
          fieldPermissionToFind.fieldMetadataId === fieldMetadataItem.id &&
          (fieldPermissionToFind.canReadFieldValue === false ||
            fieldPermissionToFind.canUpdateFieldValue === false),
      );

      return isDefined(fieldPermission)
        ? { fieldMetadataItem, fieldPermission }
        : null;
    })
    .filter(isDefined);

  const restrictedFieldMetadataIds = new Set(
    restrictedFields.map(({ fieldMetadataItem }) => fieldMetadataItem.id),
  );

  const restrictableFieldMetadataItems = userFacingFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      !restrictedFieldMetadataIds.has(fieldMetadataItem.id) &&
      (fieldMetadataItem.isUIEditable ?? true),
  );

  const roleLabel = settingsDraftRole.label;
  const objectLabelPlural = objectMetadataItem.labelPlural;

  return (
    <Section.Root>
      <Section.Header
        title={t`Restricted fields`}
        description={
          cannotAllowFieldReadRestrict
            ? t`${roleLabel} can't see ${objectLabelPlural}, so field restrictions don't apply.`
            : t`Fields ${roleLabel} can't see or can't edit. Every other field follows the actions above.`
        }
      />
      <Table>
        <TableRow
          gridTemplateColumns={RESTRICTED_FIELDS_TABLE_GRID_TEMPLATE_COLUMNS}
        >
          <TableHeader>{t`Field`}</TableHeader>
          <TableHeader>{t`Data type`}</TableHeader>
          <TableHeader>{t`Access`}</TableHeader>
          <TableHeader />
        </TableRow>
        <StyledTableRows>
          {isNonEmptyArray(restrictedFields) ? (
            restrictedFields.map(({ fieldMetadataItem, fieldPermission }) => (
              <SettingsRolePermissionsObjectLevelRestrictedFieldRow
                key={fieldMetadataItem.id}
                fieldMetadataItem={fieldMetadataItem}
                fieldPermission={fieldPermission}
                objectMetadataItem={objectMetadataItem}
                roleId={roleId}
                isEditable={settingsDraftRole.isEditable}
              />
            ))
          ) : (
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {t`No restricted fields.`}
            </TableCell>
          )}
        </StyledTableRows>
      </Table>
      {settingsDraftRole.isEditable && (
        <TableFooter>
          <SettingsRolePermissionsObjectLevelRestrictFieldDropdown
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            restrictableFieldMetadataItems={restrictableFieldMetadataItems}
            canRestrictUpdate={!cannotAllowFieldUpdateRestrict}
            disabled={
              cannotAllowFieldReadRestrict ||
              !isNonEmptyArray(restrictableFieldMetadataItems)
            }
          />
        </TableFooter>
      )}
    </Section.Root>
  );
};
