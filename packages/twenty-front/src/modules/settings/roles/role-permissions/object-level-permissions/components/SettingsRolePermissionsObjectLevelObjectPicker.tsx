import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ChangeEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(DropdownMenuSearchInput)`
  width: 100%;
`;

export const SettingsRolePermissionsObjectLevelObjectPicker = () => {
  const { roleId } = useParams();
  const navigate = useNavigateSettings();
  const [searchFilter, setSearchFilter] = useState('');
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId!),
  );

  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const { getIcon } = useIcons();

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const handleSelectObjectMetadata = (objectMetadataId: string) => {
    setSettingsDraftRole((draftRole) => ({
      ...draftRole,
      objectPermissions: [
        ...(draftRole.objectPermissions ?? []).filter(
          (permission) => permission.objectMetadataId !== objectMetadataId,
        ),
        {
          objectMetadataId,
          canReadObjectRecords: null,
          canUpdateObjectRecords: null,
          canSoftDeleteObjectRecords: null,
          canDestroyObjectRecords: null,
        },
      ],
    }));
    navigate(SettingsPath.RoleObjectLevel, {
      roleId: roleId!,
      objectMetadataId,
    });
  };

  const excludedObjectMetadataIds =
    settingsDraftRole.objectPermissions
      ?.filter(
        (objectPermission) =>
          (isDefined(objectPermission.canReadObjectRecords) &&
            objectPermission.canReadObjectRecords !==
              settingsDraftRole.canReadAllObjectRecords) ||
          (isDefined(objectPermission.canUpdateObjectRecords) &&
            objectPermission.canUpdateObjectRecords !==
              settingsDraftRole.canUpdateAllObjectRecords) ||
          (isDefined(objectPermission.canSoftDeleteObjectRecords) &&
            objectPermission.canSoftDeleteObjectRecords !==
              settingsDraftRole.canSoftDeleteAllObjectRecords) ||
          (isDefined(objectPermission.canDestroyObjectRecords) &&
            objectPermission.canDestroyObjectRecords !==
              settingsDraftRole.canDestroyAllObjectRecords),
      )
      .map((p) => p.objectMetadataId) ?? [];

  const filteredObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.labelSingular
        .toLowerCase()
        .includes(searchFilter.toLowerCase()) &&
      !excludedObjectMetadataIds.includes(objectMetadataItem.id),
  );

  return (
    <StyledContainer>
      <StyledSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search objects`}
      />
      {filteredObjectMetadataItems.map((objectMetadataItem) => (
        <MenuItem
          key={objectMetadataItem.id}
          text={objectMetadataItem.labelSingular}
          LeftIcon={getIcon(objectMetadataItem.icon)}
          onClick={() => handleSelectObjectMetadata(objectMetadataItem.id)}
        />
      ))}
    </StyledContainer>
  );
};
