import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { SettingsAdminVersionContainer } from '@/settings/admin-panel/components/SettingsAdminVersionContainer';
import { ADMIN_PANEL_RECENT_USERS } from '@/settings/admin-panel/graphql/queries/adminPanelRecentUsers';
import { ADMIN_PANEL_TOP_WORKSPACES } from '@/settings/admin-panel/graphql/queries/adminPanelTopWorkspaces';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]} 0;
`;

export const SettingsAdminGeneral = () => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [debouncedUserSearchTerm] = useDebounce(userSearchTerm, 300);

  const [workspaceSearchTerm, setWorkspaceSearchTerm] = useState('');
  const [debouncedWorkspaceSearchTerm] = useDebounce(workspaceSearchTerm, 300);

  const currentUser = useAtomStateValue(currentUserState);
  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel;
  const canImpersonate = currentUser?.canImpersonate;
  const canManageFeatureFlags = useAtomStateValue(canManageFeatureFlagsState);

  const { data: recentUsersData, loading: isLoadingUsers } = useQuery<{
    adminPanelRecentUsers: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      createdAt: string;
      workspaceName?: string | null;
      workspaceId?: string | null;
    }[];
  }>(ADMIN_PANEL_RECENT_USERS, {
    variables: { searchTerm: debouncedUserSearchTerm },
    skip: !canImpersonate,
  });

  const { data: topWorkspacesData, loading: isLoadingWorkspaces } = useQuery<{
    adminPanelTopWorkspaces: {
      id: string;
      name: string;
      totalUsers: number;
      subdomain: string;
    }[];
  }>(ADMIN_PANEL_TOP_WORKSPACES, {
    variables: { searchTerm: debouncedWorkspaceSearchTerm },
    skip: !canImpersonate,
  });

  const recentUsers = recentUsersData?.adminPanelRecentUsers ?? [];
  const topWorkspaces = topWorkspacesData?.adminPanelTopWorkspaces ?? [];

  return (
    <>
      {canAccessFullAdminPanel && (
        <Section>
          <H2Title
            title={t`About`}
            description={t`Version of the application`}
          />
          <SettingsAdminVersionContainer />
        </Section>
      )}

      {canImpersonate && (
        <>
          <Section>
            <H2Title
              title={t`Recent Users`}
              description={
                canManageFeatureFlags
                  ? t`Last 10 users created. Click to manage feature flags or impersonate.`
                  : t`Last 10 users created. Click to impersonate.`
              }
            />
            <SettingsTextInput
              instanceId="admin-panel-user-search"
              value={userSearchTerm}
              onChange={setUserSearchTerm}
              placeholder={t`Search by name, email, or user ID...`}
              fullWidth
            />
            {isLoadingUsers ? (
              <SettingsSkeletonLoader />
            ) : recentUsers.length === 0 ? (
              <StyledEmptyState>
                {t`No users found matching your search criteria.`}
              </StyledEmptyState>
            ) : (
              <Table>
                <TableBody>
                  <TableRow gridTemplateColumns="1fr 2fr 1fr">
                    <TableHeader>{t`Name`}</TableHeader>
                    <TableHeader>{t`Email`}</TableHeader>
                    <TableHeader align="right">{t`Workspace`}</TableHeader>
                  </TableRow>
                  {recentUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      gridTemplateColumns="1fr 2fr 1fr"
                      to={getSettingsPath(SettingsPath.AdminPanelUserDetail, {
                        userId: user.id,
                      })}
                    >
                      <TableCell color={themeCssVariables.font.color.primary}>
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                          '\u2014'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="right">
                        {user.workspaceName || '\u2014'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>

          <Section>
            <H2Title
              title={t`Top Workspaces`}
              description={t`Top 10 workspaces by number of users`}
            />
            <SettingsTextInput
              instanceId="admin-panel-workspace-search"
              value={workspaceSearchTerm}
              onChange={setWorkspaceSearchTerm}
              placeholder={t`Search by workspace name, subdomain, or ID...`}
              fullWidth
            />
            {isLoadingWorkspaces ? (
              <SettingsSkeletonLoader />
            ) : topWorkspaces.length === 0 ? (
              <StyledEmptyState>
                {t`No workspaces found matching your search criteria.`}
              </StyledEmptyState>
            ) : (
              <Table>
                <TableBody>
                  <TableRow gridTemplateColumns="2fr 1fr">
                    <TableHeader>{t`Workspace`}</TableHeader>
                    <TableHeader align="right">{t`Users`}</TableHeader>
                  </TableRow>
                  {topWorkspaces.map((workspace) => (
                    <TableRow
                      key={workspace.id}
                      gridTemplateColumns="2fr 1fr"
                      to={getSettingsPath(
                        SettingsPath.AdminPanelWorkspaceDetail,
                        { workspaceId: workspace.id },
                      )}
                    >
                      <TableCell color={themeCssVariables.font.color.primary}>
                        {workspace.name || '\u2014'}
                      </TableCell>
                      <TableCell align="right">
                        {workspace.totalUsers}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </>
      )}
    </>
  );
};
