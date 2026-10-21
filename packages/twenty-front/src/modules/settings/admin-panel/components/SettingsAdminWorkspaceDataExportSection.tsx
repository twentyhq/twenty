import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { formatBytes, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconDownload, IconFileExport } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateTimeString } from '@/object-record/record-field/ui/utils/formatDateTimeString';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceDataExportPollingEffect } from '@/settings/admin-panel/components/SettingsAdminWorkspaceDataExportPollingEffect';
import { CREATE_WORKSPACE_DATA_EXPORT } from '@/settings/admin-panel/graphql/mutations/createWorkspaceDataExport';
import { WORKSPACE_DATA_EXPORTS } from '@/settings/admin-panel/graphql/queries/workspaceDataExports';
import { getWorkspaceDataExportSummary } from '@/settings/admin-panel/utils/getWorkspaceDataExportSummary';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import {
  type CreateWorkspaceDataExportMutation,
  type WorkspaceDataExportsQuery,
  WorkspaceDataExportStatus,
} from '~/generated-admin/graphql';

type SettingsAdminWorkspaceDataExportSectionProps = {
  workspaceId: string;
  workspaceName: string;
};

type WorkspaceDataExportRow =
  WorkspaceDataExportsQuery['workspaceDataExports'][number];

const PENDING_EXPORT_POLL_INTERVAL_MS = 3000;

export const SettingsAdminWorkspaceDataExportSection = ({
  workspaceId,
  workspaceName,
}: SettingsAdminWorkspaceDataExportSectionProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueToast } = useToast();
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const { data, startPolling, stopPolling } =
    useQuery<WorkspaceDataExportsQuery>(WORKSPACE_DATA_EXPORTS, {
      client: apolloAdminClient,
      variables: { workspaceId },
      fetchPolicy: 'network-only',
    });

  const [createWorkspaceDataExport, { loading: isCreating }] =
    useMutation<CreateWorkspaceDataExportMutation>(
      CREATE_WORKSPACE_DATA_EXPORT,
      {
        client: apolloAdminClient,
        variables: { workspaceId },
        refetchQueries: [
          { query: WORKSPACE_DATA_EXPORTS, variables: { workspaceId } },
        ],
        onError: (error) => {
          enqueueToast({
            status: 'error',
            children: t`Failed to start the export. ${error.message}`,
          });
        },
      },
    );

  const rows = data?.workspaceDataExports ?? [];
  const hasPendingExport = rows.some(
    (row) => row.status === WorkspaceDataExportStatus.PENDING,
  );

  return (
    <>
      {hasPendingExport && (
        <SettingsAdminWorkspaceDataExportPollingEffect
          pollIntervalMs={PENDING_EXPORT_POLL_INTERVAL_MS}
          startPolling={startPolling}
          stopPolling={stopPolling}
        />
      )}
      <SettingsTableListSection<WorkspaceDataExportRow>
        title={t`Data export`}
        description={t`Every object of this workspace as CSV files in one zip, kept for 7 days. Works for suspended workspaces.`}
        headerAdornment={
          <Button
            startIcon={<IconFileExport />}
            size="sm"
            variant="outline"
            disabled={isCreating || hasPendingExport}
            onClick={() => createWorkspaceDataExport()}
          >{t`Export data`}</Button>
        }
        items={rows}
        columns={[
          {
            label: t`Created`,
            Cell: ({ item }) => (
              <>
                {formatDateTimeString({
                  value: item.createdAt,
                  timeZone,
                  dateFormat,
                  timeFormat,
                  localeCatalog,
                })}
              </>
            ),
          },
          {
            label: t`Objects`,
            Cell: ({ item }) => {
              if (!isNonEmptyArray(item.objects)) {
                return <>-</>;
              }

              const { objectCount, columnCount } =
                getWorkspaceDataExportSummary(item.objects);

              return (
                <>{t`${formatNumber(objectCount)} objects, ${formatNumber(columnCount)} columns`}</>
              );
            },
          },
          {
            label: t`Rows`,
            Cell: ({ item }) => (
              <>
                {isNonEmptyArray(item.objects)
                  ? formatNumber(
                      getWorkspaceDataExportSummary(item.objects).rowCount,
                    )
                  : '-'}
              </>
            ),
          },
          {
            label: t`Size`,
            Cell: ({ item }) => (
              <>
                {item.status === WorkspaceDataExportStatus.COMPLETED
                  ? formatBytes(item.sizeInBytes)
                  : '-'}
              </>
            ),
          },
          {
            label: t`Status`,
            Cell: ({ item }) => {
              if (item.status === WorkspaceDataExportStatus.COMPLETED) {
                return <Tag color="green">{t`Ready`}</Tag>;
              }

              if (item.status === WorkspaceDataExportStatus.FAILED) {
                return <Tag color="red">{t`Failed`}</Tag>;
              }

              const { objectCount, exportedObjectCount } =
                getWorkspaceDataExportSummary(item.objects);
              const progress =
                objectCount > 0 ? ` ${exportedObjectCount}/${objectCount}` : '';

              return (
                <Tag color="orange">
                  {t`In progress`}
                  {progress}
                </Tag>
              );
            },
          },
          {
            label: '',
            align: 'right',
            Cell: ({ item }) => {
              const { downloadUrl } = item;

              if (!isDefined(downloadUrl)) {
                return null;
              }

              return (
                <Button
                  startIcon={<IconDownload />}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadFile(
                      downloadUrl,
                      `${workspaceName}-export-${item.id}.zip`,
                    )
                  }
                >{t`Download`}</Button>
              );
            },
          },
        ]}
        gridAutoColumns="3fr 3fr 2fr 2fr 2fr 140px"
      />
    </>
  );
};
