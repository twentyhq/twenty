import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FIELD_PERMISSION_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTableRow';
import { useFieldPermissionTableColumns } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useFieldPermissionTableColumns';
import { useRemoveReadOverrideOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRemoveReadOverrideOnAllFieldsOfObject';
import { useRemoveUpdateOverrideOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRemoveUpdateOverrideOnAllFieldsOfObject';
import { useRestrictReadOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRestrictReadOnAllFieldsOfObject';
import { useRestrictUpdateOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRestrictUpdateOnAllFieldsOfObject';
import { OverridableCheckbox } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/OverridableCheckbox';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Label } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSectionHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  grid-template-columns: ${FIELD_PERMISSION_TABLE_ROW_GRID_TEMPLATE_COLUMNS};

  height: ${themeCssVariables.spacing[6]};

  width: 100%;
`;

const StyledLabelContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[1]};
`;

export const SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow =
  ({
    roleId,
    objectMetadataItem,
  }: {
    roleId: string;
    objectMetadataItem: EnrichedObjectMetadataItem;
  }) => {
    const { t } = useLingui();

    const settingsDraftRole = useAtomFamilyStateValue(
      settingsDraftRoleFamilyState,
      roleId,
    );

    const { shouldShowSeeColumn, shouldShowUpdateColumn } =
      useFieldPermissionTableColumns({
        roleId,
        objectMetadataItemId: objectMetadataItem.id,
      });

    const fieldPermissionsForThisObject =
      settingsDraftRole.fieldPermissions?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.objectMetadataId === objectMetadataItem.id,
      ) ?? [];

    const hasAnyRestrictionOnRead = fieldPermissionsForThisObject.some(
      (fieldPermission) => fieldPermission.canReadFieldValue === false,
    );

    const hasAnyRestrictionOnUpdate = fieldPermissionsForThisObject.some(
      (fieldPermission) => fieldPermission.canUpdateFieldValue === false,
    );

    const { restrictReadOnAllFieldsOfObject } =
      useRestrictReadOnAllFieldsOfObject({ roleId });

    const { removeReadOverrideOnAllFieldsOfObject } =
      useRemoveReadOverrideOnAllFieldsOfObject({ roleId });

    const { removeUpdateOverrideOnAllFieldsOfObject } =
      useRemoveUpdateOverrideOnAllFieldsOfObject({ roleId });

    const { restrictUpdateOnAllFieldsOfObject } =
      useRestrictUpdateOnAllFieldsOfObject({ roleId });

    const handleReadAllChange = () => {
      if (hasAnyRestrictionOnRead) {
        removeReadOverrideOnAllFieldsOfObject(objectMetadataItem);
      } else {
        restrictReadOnAllFieldsOfObject(objectMetadataItem);
      }
    };

    const handleUpdateAllChange = () => {
      if (hasAnyRestrictionOnUpdate) {
        removeUpdateOverrideOnAllFieldsOfObject(objectMetadataItem);
      } else {
        restrictUpdateOnAllFieldsOfObject(objectMetadataItem);
      }
    };

    return (
      <StyledSectionHeader>
        <StyledLabelContainer>
          <Label>{t`All`}</Label>
        </StyledLabelContainer>
        <div />
        <>
          {!shouldShowSeeColumn && <div />}
          {!shouldShowUpdateColumn && <div />}
          {shouldShowSeeColumn && (
            <StyledCheckboxContainer>
              <OverridableCheckbox
                disabled={false}
                checked={true}
                onChange={handleReadAllChange}
                type={hasAnyRestrictionOnRead ? 'override' : 'default'}
              />
            </StyledCheckboxContainer>
          )}
          {shouldShowUpdateColumn && (
            <StyledCheckboxContainer>
              <OverridableCheckbox
                disabled={false}
                checked={true}
                onChange={handleUpdateAllChange}
                type={hasAnyRestrictionOnUpdate ? 'override' : 'default'}
              />
            </StyledCheckboxContainer>
          )}
        </>
      </StyledSectionHeader>
    );
  };
