import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FIELD_LEVEL_PERMISSION_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/constants/FieldLevelPermissionTableGridTemplateColumns';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { useRemoveReadOverrideOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRemoveReadOverrideOnAllFieldsOfObject';
import { useRemoveUpdateOverrideOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRemoveUpdateOverrideOnAllFieldsOfObject';
import { useRestrictReadOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRestrictReadOnAllFieldsOfObject';
import { useRestrictUpdateOnAllFieldsOfObject } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRestrictUpdateOnAllFieldsOfObject';
import { OverridableCheckbox } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/OverridableCheckbox';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { Label } from 'twenty-ui/display';

const StyledSectionHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: grid;
  grid-template-columns: ${FIELD_LEVEL_PERMISSION_TABLE_GRID_TEMPLATE_COLUMNS};

  height: ${({ theme }) => theme.spacing(6)};

  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsRolePermissionsObjectLevelObjectFieldPermissionTableAllHeaderRow =
  ({
    roleId,
    objectMetadataItem,
  }: {
    roleId: string;
    objectMetadataItem: ObjectMetadataItem;
  }) => {
    const { t } = useLingui();

    const [settingsDraftRole] = useRecoilState(
      settingsDraftRoleFamilyState(roleId),
    );

    const { cannotAllowFieldReadRestrict, cannotAllowFieldUpdateRestrict } =
      useObjectPermissionDerivedStates({
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
      <>
        <StyledSectionHeader>
          <Label>{t`All`}</Label>
          <div></div>
          {cannotAllowFieldReadRestrict ? (
            <div></div>
          ) : (
            <StyledCheckboxContainer>
              <OverridableCheckbox
                disabled={false}
                checked={true}
                onChange={handleReadAllChange}
                type={hasAnyRestrictionOnRead ? 'override' : 'default'}
              />
            </StyledCheckboxContainer>
          )}
          {cannotAllowFieldUpdateRestrict ? (
            <div></div>
          ) : (
            <StyledCheckboxContainer>
              <OverridableCheckbox
                disabled={false}
                checked={true}
                onChange={handleUpdateAllChange}
                type={hasAnyRestrictionOnUpdate ? 'override' : 'default'}
              />
            </StyledCheckboxContainer>
          )}
        </StyledSectionHeader>
      </>
    );
  };
