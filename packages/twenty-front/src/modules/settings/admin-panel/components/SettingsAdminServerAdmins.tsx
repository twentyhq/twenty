import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { GetServerAdminsDocument } from '~/generated-admin/graphql';

const SERVER_ADMINS_GRID_TEMPLATE_COLUMNS = '2fr 1fr 1fr 36px';

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]} 0;
`;

export const SettingsAdminServerAdmins = () => {
  const { theme } = useContext(ThemeContext);
  const apolloAdminClient = useApolloAdminClient();

  const { data, loading, error } = useQuery(GetServerAdminsDocument, {
    client: apolloAdminClient,
  });

  const serverAdmins = data?.getServerAdmins ?? [];

  return (
    <Section>
      <H2Title
        title={t`Administrators`}
        description={t`Users with server-level access. Open a user to grant or revoke access; use the search below to find anyone.`}
      />
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : error ? (
        <StyledEmptyState>{t`Failed to load server administrators.`}</StyledEmptyState>
      ) : serverAdmins.length === 0 ? (
        <StyledEmptyState>{t`No server administrators found.`}</StyledEmptyState>
      ) : (
        <Table>
          <TableBody>
            <TableRow gridTemplateColumns={SERVER_ADMINS_GRID_TEMPLATE_COLUMNS}>
              <TableHeader>{t`Administrator`}</TableHeader>
              <TableHeader>{t`Admin panel`}</TableHeader>
              <TableHeader>{t`Impersonation`}</TableHeader>
              <TableHeader />
            </TableRow>
            {serverAdmins.map((admin) => {
              const adminLabel =
                `${admin.firstName || ''} ${admin.lastName || ''}`.trim() ||
                admin.email;

              return (
                <TableRow
                  key={admin.id}
                  gridTemplateColumns={SERVER_ADMINS_GRID_TEMPLATE_COLUMNS}
                  to={getSettingsPath(SettingsPath.AdminPanelUserDetail, {
                    userId: admin.id,
                  })}
                >
                  <TableCell
                    color={themeCssVariables.font.color.primary}
                    overflow="hidden"
                  >
                    <OverflowingTextWithTooltip text={adminLabel} />
                  </TableCell>
                  <TableCell>
                    {admin.canAccessFullAdminPanel ? t`Yes` : '—'}
                  </TableCell>
                  <TableCell>{admin.canImpersonate ? t`Yes` : '—'}</TableCell>
                  <TableCell align="center">
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                      color={theme.font.color.tertiary}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Section>
  );
};
