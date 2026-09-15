import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { RecordExportNotificationEffect } from '@/record-export/components/RecordExportNotificationEffect';
import { RECORD_EXPORT_UPDATED_EVENT } from '@/record-export/constants/RecordExportUpdatedEvent';
import { type RecordExportSummary } from '@/record-export/types/RecordExportSummary';
import { mergeRecordExports } from '@/record-export/utils/mergeRecordExports';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useState } from 'react';
import {
  FindManyRecordExportsDocument,
  PermissionFlagType,
  RecordExportStatus,
} from '~/generated-metadata/graphql';

type RecordExportManagerContentProps = {
  workspaceId: string;
  workspaceMemberId: string;
};

const RecordExportManagerContent = ({
  workspaceId,
  workspaceMemberId,
}: RecordExportManagerContentProps) => {
  const client = useApolloClient();
  const [exports, setExports] = useState<RecordExportSummary[]>([]);
  const hasRunningExport = exports.some(
    (recordExport) =>
      recordExport.status === RecordExportStatus.QUEUED ||
      recordExport.status === RecordExportStatus.PROCESSING,
  );

  useEffect(() => {
    let mounted = true;
    let fetching = false;
    let retryTimeout: number | undefined;
    const refresh = async () => {
      if (fetching) return;
      fetching = true;
      window.clearTimeout(retryTimeout);
      try {
        const { data } = await client.query({
          query: FindManyRecordExportsDocument,
          fetchPolicy: 'no-cache',
          context: { queryDeduplication: false },
        });
        if (mounted && data)
          setExports((previous) =>
            mergeRecordExports(previous, data.findManyRecordExports),
          );
      } catch {
        if (mounted) retryTimeout = window.setTimeout(refresh, 5000);
      } finally {
        fetching = false;
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(SSE_CLIENT_RECONNECTED_EVENT_NAME, refresh);
    const interval = hasRunningExport
      ? window.setInterval(refresh, 5000)
      : undefined;
    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.clearTimeout(retryTimeout);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(SSE_CLIENT_RECONNECTED_EVENT_NAME, refresh);
    };
  }, [client, hasRunningExport]);

  useListenToBrowserEvent<RecordExportSummary>({
    eventName: RECORD_EXPORT_UPDATED_EVENT,
    onBrowserEvent: useCallback(
      (recordExport) => {
        if (
          recordExport?.workspaceId === workspaceId &&
          recordExport.workspaceMemberId === workspaceMemberId
        )
          setExports((previous) =>
            mergeRecordExports(previous, [recordExport]),
          );
      },
      [workspaceId, workspaceMemberId],
    ),
  });

  return (
    <>
      {[...exports].reverse().map((recordExport) => (
        <RecordExportNotificationEffect
          key={recordExport.id}
          recordExport={recordExport}
        />
      ))}
    </>
  );
};

export const RecordExportManager = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const canExport = useHasPermissionFlag(PermissionFlagType.EXPORT_CSV);

  return canExport && currentWorkspaceMember && currentWorkspace ? (
    <RecordExportManagerContent
      key={`${currentWorkspace.id}:${currentWorkspaceMember.id}`}
      workspaceId={currentWorkspace.id}
      workspaceMemberId={currentWorkspaceMember.id}
    />
  ) : null;
};
