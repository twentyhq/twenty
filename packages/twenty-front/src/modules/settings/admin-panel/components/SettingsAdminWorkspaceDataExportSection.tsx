import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { formatBytes, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconDownload } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateTimeString } from '@/object-record/record-field/ui/utils/formatDateTimeString';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceDataExportsFetchEffect } from '@/settings/admin-panel/components/SettingsAdminWorkspaceDataExportsFetchEffect';
import { CREATE_WORKSPACE_DATA_EXPORT } from '@/settings/admin-panel/graphql/mutations/createWorkspaceDataExport';
import { WORKSPACE_DATA_EXPORTS } from '@/settings/admin-panel/graphql/queries/workspaceDataExports';
import { adminPanelWorkspaceDataExportsFamilyState } from '@/settings/admin-panel/states/adminPanelWorkspaceDataExportsFamilyState';
import { getWorkspaceDataExportSummary } from '@/settings/admin-panel/utils/getWorkspaceDataExportSummary';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
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

const StyledCreatedAt = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

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

  const adminPanelWorkspaceDataExports = useAtomFamilyStateValue(
    adminPanelWorkspaceDataExportsFamilyState,
    workspaceId,
  );

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

  const hasPendingExport = adminPanelWorkspaceDataExports.some(
    (workspaceDataExport) =>
      workspaceDataExport.status === WorkspaceDataExportStatus.PENDING,
  );

  return (
    <>
      <SettingsAdminWorkspaceDataExportsFetchEffect workspaceId={workspaceId} />
      <SettingsTableListSection<WorkspaceDataExportRow>
        title={t`Data export`}
        description={t`Every object of this workspace as CSV files in one zip, kept for 1 day. Works for suspended workspaces.`}
        items={adminPanelWorkspaceDataExports}
        columns={[
          {
            label: t`Created`,
            Cell: ({ item }) => (
              <StyledCreatedAt>
                {formatDateTimeString({
                  value: item.createdAt,
                  timeZone,
                  dateFormat,
                  timeFormat,
                  localeCatalog,
                })}
              </StyledCreatedAt>
            ),
          },
          {
            label: t`Contents`,
            Cell: ({ item }) => {
              if (!isNonEmptyArray(item.objects)) {
                return <>-</>;
              }

              const { objectCount, recordCount } =
                getWorkspaceDataExportSummary(item.objects);

              if (item.status !== WorkspaceDataExportStatus.COMPLETED) {
                return <>{t`${formatNumber(objectCount)} objects`}</>;
              }

              return (
                <>{t`${formatNumber(objectCount)} objects, ${formatNumber(recordCount)} records`}</>
              );
            },
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
            label: '',
            align: 'right',
            Cell: ({ item }) => {
              if (item.status === WorkspaceDataExportStatus.FAILED) {
                return <Status color="red" weight="medium">{t`Failed`}</Status>;
              }

              if (item.status === WorkspaceDataExportStatus.PENDING) {
                const { objectCount, exportedObjectCount } =
                  getWorkspaceDataExportSummary(item.objects);
                const progress =
                  objectCount > 0
                    ? ` ${exportedObjectCount}/${objectCount}`
                    : '';

                return (
                  <Status color="turquoise" weight="medium" loading>
                    {t`In progress`}
                    {progress}
                  </Status>
                );
              }

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
        gridAutoColumns="3fr 4fr 2fr 180px"
        footerButtonLabel={t`Export data`}
        onFooterButtonClick={() => createWorkspaceDataExport()}
        isFooterButtonDisabled={isCreating || hasPendingExport}
      />
    </>
  );
};
