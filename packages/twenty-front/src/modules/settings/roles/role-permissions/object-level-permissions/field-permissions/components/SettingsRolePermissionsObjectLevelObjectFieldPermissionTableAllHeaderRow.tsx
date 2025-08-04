import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { OverridableCheckbox } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/OverridableCheckbox';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Label } from 'twenty-ui/display';
import { v4 } from 'uuid';

const StyledSectionHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: grid;
  grid-template-columns: 180px 1fr 60px 60px;

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

    const restrictableFieldMetadataItems = objectMetadataItem.fields.filter(
      filterUserFacingFieldMetadataItems,
    );

    const { cannotAllowFieldReadRestrict, cannotAllowFieldUpdateRestrict } =
      useObjectPermissionDerivedStates({
        roleId,
        objectMetadataItemId: objectMetadataItem.id,
      });

    const { upsertFieldPermissionInDraftRole } =
      useUpsertFieldPermissionInDraftRole(roleId);

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

    const handleReadAllChange = () => {
      if (hasAnyRestrictionOnRead) {
        for (const fieldPermissionToChange of fieldPermissionsForThisObject) {
          upsertFieldPermissionInDraftRole({
            ...fieldPermissionToChange,
            canReadFieldValue: null,
          });
        }
      } else {
        if (fieldPermissionsForThisObject.length === 0) {
          for (const fieldMetadataItem of restrictableFieldMetadataItems) {
            upsertFieldPermissionInDraftRole({
              fieldMetadataId: fieldMetadataItem.id,
              objectMetadataId: objectMetadataItem.id,
              canUpdateFieldValue: false,
              canReadFieldValue: false,
              id: v4(),
              roleId,
            });
          }
        } else {
          for (const fieldMetadataItem of restrictableFieldMetadataItems) {
            const foundFieldPermission = fieldPermissionsForThisObject.find(
              (fieldPermissionToFind) =>
                fieldPermissionToFind.fieldMetadataId === fieldMetadataItem.id,
            );

            if (isDefined(foundFieldPermission)) {
              upsertFieldPermissionInDraftRole({
                ...foundFieldPermission,
                canReadFieldValue: false,
                canUpdateFieldValue: false,
              });
            } else {
              upsertFieldPermissionInDraftRole({
                fieldMetadataId: fieldMetadataItem.id,
                objectMetadataId: objectMetadataItem.id,
                canReadFieldValue: false,
                canUpdateFieldValue: false,
                id: v4(),
                roleId,
              });
            }
          }
        }
      }
    };

    const handleUpdateAllChange = () => {
      if (hasAnyRestrictionOnUpdate) {
        for (const fieldPermissionToChange of fieldPermissionsForThisObject) {
          upsertFieldPermissionInDraftRole({
            ...fieldPermissionToChange,
            canUpdateFieldValue: null,
            canReadFieldValue: null,
          });
        }
      } else {
        const shouldCreateUpdatePermissionForAllFields =
          fieldPermissionsForThisObject.length === 0;

        if (shouldCreateUpdatePermissionForAllFields) {
          for (const fieldMetadataItem of restrictableFieldMetadataItems) {
            upsertFieldPermissionInDraftRole({
              fieldMetadataId: fieldMetadataItem.id,
              objectMetadataId: objectMetadataItem.id,
              canUpdateFieldValue: false,
              canReadFieldValue: null,
              id: v4(),
              roleId,
            });
          }
        } else {
          for (const fieldMetadataItem of restrictableFieldMetadataItems) {
            const alreadyExistingFieldPermission =
              fieldPermissionsForThisObject.find(
                (fieldPermissionToFind) =>
                  fieldPermissionToFind.fieldMetadataId ===
                  fieldMetadataItem.id,
              );

            if (isDefined(alreadyExistingFieldPermission)) {
              upsertFieldPermissionInDraftRole({
                ...alreadyExistingFieldPermission,
                canUpdateFieldValue: false,
              });
            } else {
              upsertFieldPermissionInDraftRole({
                fieldMetadataId: fieldMetadataItem.id,
                objectMetadataId: objectMetadataItem.id,
                canUpdateFieldValue: false,
                canReadFieldValue: null,
                id: v4(),
                roleId,
              });
            }
          }
        }
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
