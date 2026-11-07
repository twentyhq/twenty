import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { WORKSPACE_DATA_EXPORTS } from '@/settings/admin-panel/graphql/queries/workspaceDataExports';
import { adminPanelWorkspaceDataExportsFamilyState } from '@/settings/admin-panel/states/adminPanelWorkspaceDataExportsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  type WorkspaceDataExportsQuery,
  WorkspaceDataExportStatus,
} from '~/generated-admin/graphql';

const PENDING_EXPORT_POLL_INTERVAL_MS = 3000;

type SettingsAdminWorkspaceDataExportsFetchEffectProps = {
  workspaceId: string;
};

export const SettingsAdminWorkspaceDataExportsFetchEffect = ({
  workspaceId,
}: SettingsAdminWorkspaceDataExportsFetchEffectProps) => {
  const apolloAdminClient = useApolloAdminClient();
  const setAdminPanelWorkspaceDataExports = useSetAtomFamilyState(
    adminPanelWorkspaceDataExportsFamilyState,
    workspaceId,
  );

  const { data, startPolling, stopPolling } =
    useQuery<WorkspaceDataExportsQuery>(WORKSPACE_DATA_EXPORTS, {
      client: apolloAdminClient,
      variables: { workspaceId },
      fetchPolicy: 'network-only',
      skip: !isNonEmptyString(workspaceId),
    });

  const workspaceDataExports = data?.workspaceDataExports;
  const hasPendingExport =
    workspaceDataExports?.some(
      (workspaceDataExport) =>
        workspaceDataExport.status === WorkspaceDataExportStatus.PENDING,
    ) ?? false;

  useEffect(() => {
    if (isDefined(workspaceDataExports)) {
      setAdminPanelWorkspaceDataExports(workspaceDataExports);
    }
  }, [workspaceDataExports, setAdminPanelWorkspaceDataExports]);

  useEffect(() => {
    if (!hasPendingExport) {
      return;
    }

    startPolling(PENDING_EXPORT_POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [hasPendingExport, startPolling, stopPolling]);

  return null;
};
