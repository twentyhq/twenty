import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AdminApplicationMonitoringData } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringData';
import { getAdminApplicationMonitoringWorkspaceLabel } from '@/settings/admin-panel/apps/utils/getAdminApplicationMonitoringWorkspaceLabel';
import { APPLICATION_MONITORING_TABLE_METRIC_COLUMNS } from '@/settings/application-monitoring/constants/ApplicationMonitoringTableMetricColumns';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const WORKSPACES_GRID_TEMPLATE_COLUMNS = `minmax(0, 1fr) 96px 96px ${APPLICATION_MONITORING_TABLE_METRIC_COLUMNS}`;

type SettingsAdminApplicationMonitoringWorkspacesTableProps = {
  workspaces: AdminApplicationMonitoringData['workspaces'];
};

export const SettingsAdminApplicationMonitoringWorkspacesTable = ({
  workspaces,
}: SettingsAdminApplicationMonitoringWorkspacesTableProps) => {
  const { t, i18n } = useLingui();

  if (workspaces.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`No workspace ran this app in this period`}</SettingsEmptyPlaceholder>
    );
  }

  return (
    <Table>
      <TableRow gridTemplateColumns={WORKSPACES_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Workspace`}</TableHeader>
        <TableHeader>{t`Version`}</TableHeader>
        <TableHeader align="right">{t`Rate limits`}</TableHeader>
        <TableHeader align="right">{t`Runs`}</TableHeader>
        <TableHeader align="right">{t`Failed`}</TableHeader>
        <TableHeader align="right">{t`Last event`}</TableHeader>
      </TableRow>
      <TableBody>
        {workspaces.map((workspace) => (
          <TableRow
            key={workspace.workspaceId}
            gridTemplateColumns={WORKSPACES_GRID_TEMPLATE_COLUMNS}
            to={getSettingsPath(SettingsPath.AdminPanelWorkspaceDetail, {
              workspaceId: workspace.workspaceId,
            })}
          >
            <TableCell
              color={themeCssVariables.font.color.primary}
              gap={themeCssVariables.spacing[2]}
              overflow="hidden"
            >
              <Avatar
                src={getAbsoluteImageUrl(workspace.workspaceLogoUrl)}
                name={getAdminApplicationMonitoringWorkspaceLabel(workspace)}
                colorSeed={workspace.workspaceId}
                size="md"
              />
              <OverflowingTextWithTooltip
                text={getAdminApplicationMonitoringWorkspaceLabel(workspace)}
              />
            </TableCell>
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {workspace.applicationVersion}
            </TableCell>
            <TableCell align="right">
              {i18n.number(workspace.rateLimitEventCount)}
            </TableCell>
            <TableCell align="right">
              {i18n.number(workspace.runCount)}
            </TableCell>
            <TableCell
              align="right"
              color={
                workspace.failedRunCount > 0
                  ? themeCssVariables.color.red
                  : themeCssVariables.font.color.tertiary
              }
            >
              {i18n.number(workspace.failedRunCount)}
            </TableCell>
            <TableCell
              align="right"
              color={themeCssVariables.font.color.tertiary}
            >
              {beautifyPastDateRelativeToNow(workspace.lastEventAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
