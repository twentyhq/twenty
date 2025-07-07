import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { hasPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/utils/hasPermissionOverride';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { H2Title, IconSearch, useIcons } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTypeSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: inherit;
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
`;

const StyledCardContainer = styled.div`
  cursor: pointer;
  display: flex;
  position: relative;
  width: calc(50% - ${({ theme }) => theme.spacing(1)});
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(TextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

export const SettingsRolePermissionsObjectLevelObjectPicker = ({
  roleId,
}: {
  roleId: string;
}) => {
  const theme = useTheme();
  const navigate = useNavigateSettings();
  const [searchFilter, setSearchFilter] = useState('');
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const { getIcon } = useIcons();

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
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
      roleId,
      objectMetadataId,
    });
  };

  const excludedObjectMetadataIds = useMemo(
    () =>
      settingsDraftRole.objectPermissions
        ?.filter((objectPermission) =>
          hasPermissionOverride(objectPermission, settingsDraftRole),
        )
        .map((p) => p.objectMetadataId) ?? [],
    [settingsDraftRole],
  );

  const filteredObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter(
        (objectMetadataItem) =>
          objectMetadataItem.labelPlural
            .toLowerCase()
            .includes(searchFilter.toLowerCase()) &&
          !excludedObjectMetadataIds.includes(objectMetadataItem.id) &&
          !isWorkflowRelatedObjectMetadata(objectMetadataItem.nameSingular),
      ),
    [objectMetadataItems, searchFilter, excludedObjectMetadataIds],
  );

  const standardObjects = filteredObjectMetadataItems.filter(
    (item) => !item.isCustom,
  );
  const customObjects = filteredObjectMetadataItems.filter(
    (item) => item.isCustom,
  );

  return (
    <StyledTypeSelectContainer>
      <Section>
        <StyledSearchContainer>
          <StyledSearchInput
            instanceId="role-permissions-object-search"
            value={searchFilter}
            onChange={handleSearchChange}
            placeholder={t`Search an object`}
            fullWidth
            LeftIcon={IconSearch}
            sizeVariant="lg"
          />
        </StyledSearchContainer>
      </Section>

      {standardObjects.length > 0 && (
        <Section>
          <H2Title
            title={t`Standard`}
            description={t`All the standard objects`}
          />
          <StyledContainer>
            {standardObjects.map((objectMetadataItem) => {
              const Icon = getIcon(objectMetadataItem.icon);
              return (
                <StyledCardContainer
                  key={objectMetadataItem.id}
                  onClick={() =>
                    handleSelectObjectMetadata(objectMetadataItem.id)
                  }
                >
                  <SettingsCard
                    Icon={
                      <Icon
                        size={theme.icon.size.lg}
                        stroke={theme.icon.stroke.sm}
                      />
                    }
                    title={objectMetadataItem.labelPlural}
                  />
                </StyledCardContainer>
              );
            })}
          </StyledContainer>
        </Section>
      )}

      {customObjects.length > 0 && (
        <Section>
          <H2Title title={t`Custom`} description={t`All your custom objects`} />
          <StyledContainer>
            {customObjects.map((objectMetadataItem) => {
              const Icon = getIcon(objectMetadataItem.icon);
              return (
                <StyledCardContainer
                  key={objectMetadataItem.id}
                  onClick={() =>
                    handleSelectObjectMetadata(objectMetadataItem.id)
                  }
                >
                  <SettingsCard
                    key={objectMetadataItem.id}
                    Icon={
                      <Icon
                        size={theme.icon.size.lg}
                        stroke={theme.icon.stroke.sm}
                      />
                    }
                    title={objectMetadataItem.labelPlural}
                  />
                </StyledCardContainer>
              );
            })}
          </StyledContainer>
        </Section>
      )}
    </StyledTypeSelectContainer>
  );
};
