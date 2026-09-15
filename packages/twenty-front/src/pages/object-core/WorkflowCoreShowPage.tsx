import { useParams } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { useRefetchCoreRecordOnWorkspaceRecordLifecycleChange } from '@/object-core/hooks/useRefetchCoreRecordOnWorkspaceRecordLifecycleChange';
import { useCoreWorkflowByIdShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowByIdShowPageResource';
import { RecordShowPageShell } from '@/object-record/record-show/components/RecordShowPageShell';

export const WorkflowCoreShowPage = () => {
  const { coreWorkflowId = '' } = useParams<{ coreWorkflowId: string }>();

  const { record, loading, error, refetch } =
    useCoreWorkflowByIdShowPageResource({ coreWorkflowId });

  const workspaceWorkflowId = record?.workspaceWorkflowId;

  useRefetchCoreRecordOnWorkspaceRecordLifecycleChange({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordId: workspaceWorkflowId ?? undefined,
    refetch,
  });

  if (!loading && !isDefined(error) && !isDefined(record)) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <RecordShowPageShell
      objectNameSingular={CoreObjectNameSingular.Workflow}
      objectRecordId={coreWorkflowId}
      record={record}
      loading={loading}
      error={error}
    />
  );
};
