import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevel } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevel';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { H3Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledObjectTypeTag = styled(SettingsDataModelObjectTypeTag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(5)};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
`;

type SettingsRolePermissionsObjectLevelObjectFormProps = {
  roleId: string;
  objectMetadataId: string;
};

export const SettingsRolePermissionsObjectLevelObjectForm = ({
  roleId,
  objectMetadataId,
}: SettingsRolePermissionsObjectLevelObjectFormProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectMetadata = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const objectMetadataItem = objectMetadata.objectMetadataItem;

  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <SubMenuTopBarContainer
      title={
        <StyledTitleContainer>
          <H3Title title={objectMetadataItem.labelPlural} />
          <StyledObjectTypeTag objectTypeLabel={objectTypeLabel} />
        </StyledTitleContainer>
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Roles',
          href: getSettingsPath(SettingsPath.Roles),
        },
        {
          children: settingsDraftRole.label,
          href: getSettingsPath(SettingsPath.RoleDetail, {
            roleId,
          }),
        },
        {
          children: `Permissions · ${objectMetadataItem.labelSingular}`,
        },
      ]}
      actionButton={
        <Button
          title={t`Back`}
          variant="primary"
          size="small"
          accent="blue"
          to={getSettingsPath(SettingsPath.RoleDetail, {
            roleId,
          })}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevel
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
