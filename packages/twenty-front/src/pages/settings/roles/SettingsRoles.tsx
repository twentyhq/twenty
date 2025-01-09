import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { H1Title, H2Title, IconPlus } from 'twenty-ui';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRoleCoverImage } from '@/settings/roles/SettingsRolesCoverImage';
import { useDeleteRole } from '@/settings/roles/hooks/useDeleteRole';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';
import { useUpdateRole } from '@/settings/roles/hooks/useUpdateRole';
import {
  ActionType,
  SettingsRoleFieldActionDropdown,
} from '@/settings/roles/role-details/SettingsRoleFieldActionDropdown';
import { SettingsRoleFieldDisabledActionDropdown } from '@/settings/roles/role-details/SettingsRoleFieldDisabledActionDropdown';
import {
  SettingsRoleItemTableRow,
  StyledRoleTableRow,
} from '@/settings/roles/role-details/SettingsRoleItemTableRow';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { useTranslation } from 'react-i18next';


const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsRoles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { roles, loading, refetch } = useFindAllRoles();
  const { toggleRoleActive } = useUpdateRole();
  const { deleteRoleById } = useDeleteRole();

  useEffect(() => {
    refetch();
  }, []);

  // TODO: when integrating with the backend, redo the paths so that they are standardized in lower case (Problems with : { children: `${roleSlug}` })
  const handleEditRole = (roleName: string, action: ActionType) => {
    const path = getSettingsPagePath(SettingsPath.EditRole).replace(
      ':roleSlug',
      roleName,
    )

    navigate(path);
  };

  const handleToggleRoleActive = async (roleId: string) => {
    await toggleRoleActive(roleId);
  };

  const onDeleteRole = (roleId: string) => {
    deleteRoleById(roleId);
    refetch();
  };

  console.log('ROLES', roles)
  return (
    <SubMenuTopBarContainer 
        links={[
        {
            children: 'Workspace',
            href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Roles',
          href: getSettingsPagePath(SettingsPath.MembersRoles),
        },
        ]} 
        title="Roles">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <StyledH1Title title={''} />
          <UndecoratedLink to={getSettingsPagePath(SettingsPath.NewRole)}>
            <Button
              Icon={IconPlus}
              title={t('newRole')}
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
        </SettingsHeaderContainer>
        <div>
          <SettingsRoleCoverImage />
          <Section>
            <H2Title title={t('existingRoles')} />
            <Table>
              <StyledRoleTableRow>
                <TableHeader>{t('name')}</TableHeader>
                <TableHeader>{t('type')}</TableHeader>
                <TableHeader align="right">{t('users')}</TableHeader>
                <TableHeader></TableHeader>
                <TableHeader></TableHeader>
              </StyledRoleTableRow>
              {!loading && (
                <>
                  {roles.some((role) => role.isActive) && (
                    <TableSection title={t('active')}>
                      {roles
                        .filter((role) => role.isActive)
                        .map((roleItem) => (
                          <SettingsRoleItemTableRow
                            key={roleItem.id}
                            roleItem={roleItem}
                            actions={
                              <SettingsRoleFieldActionDropdown
                                isCustomField={roleItem.isCustom}
                                scopeKey={roleItem.name}
                                onEdit={(action) =>
                                  handleEditRole(roleItem.name, action)
                                }
                                onDeactivate={() =>
                                  handleToggleRoleActive(roleItem.id)
                                }
                              />
                            }
                          />
                        ))}
                    </TableSection>
                  )}
                  {roles.some((role) => !role.isActive) && (
                    <TableSection title={t('inactive')}>
                      {roles
                        .filter((role) => !role.isActive)
                        .map((roleItem) => (
                          <SettingsRoleItemTableRow
                            key={roleItem.id}
                            roleItem={roleItem}
                            actions={
                              <SettingsRoleFieldDisabledActionDropdown
                                isCustomField={roleItem.isCustom}
                                scopeKey={roleItem.name}
                                roleId={roleItem.id}
                                onActivate={() =>
                                  handleToggleRoleActive(roleItem.id)
                                }
                                onDelete={() => onDeleteRole(roleItem.id)}
                              />
                            }
                          />
                        ))}
                    </TableSection>
                  )}
                </>
              )}
            </Table>
          </Section>
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
