import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRow';
import { useFilterObjectMetadataItemsWithPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useFilterObjectWithPermissionOverride';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledCreateObjectOverrideSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRolePermissionsObjectLevelSectionProps = {
  roleId: string;
  isEditable: boolean;
};

const StyledNoOverride = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsRolePermissionsObjectLevelSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsObjectLevelSectionProps) => {
  const navigateSettings = useNavigateSettings();

  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const { filterObjectMetadataItemsWithPermissionOverride } =
    useFilterObjectMetadataItemsWithPermissionOverride({
      roleId,
    });

  const objectMetadataItemsWithPermissionOverride =
    objectMetadataItemsThatCanHavePermission.filter(
      filterObjectMetadataItemsWithPermissionOverride,
    );

  const allObjectsHaveSetPermission =
    objectMetadataItemsWithPermissionOverride.length ===
    objectMetadataItemsThatCanHavePermission.length;

  const handleAddRule = () => {
    navigateSettings(SettingsPath.RoleAddObjectLevel, {
      roleId,
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Object-Level`}
        description={t`Actions users can perform on specific objects`}
      />
      <Table>
        <SettingsRolePermissionsObjectLevelTableHeader />
        <StyledTableRows>
          {objectMetadataItemsWithPermissionOverride.length > 0 ? (
            objectMetadataItemsWithPermissionOverride.map(
              (objectMetadataItem) => (
                <SettingsRolePermissionsObjectLevelTableRow
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  roleId={roleId}
                />
              ),
            )
          ) : (
            <StyledNoOverride>{t`No permissions found`}</StyledNoOverride>
          )}
        </StyledTableRows>
      </Table>
      <StyledCreateObjectOverrideSection>
        <Button
          Icon={IconPlus}
          title={t`Add rule`}
          variant="secondary"
          size="small"
          disabled={!isEditable || allObjectsHaveSetPermission}
          onClick={handleAddRule}
        />
      </StyledCreateObjectOverrideSection>
    </Section>
  );
};
