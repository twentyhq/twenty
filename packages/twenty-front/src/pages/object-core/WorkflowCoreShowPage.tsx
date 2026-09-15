import { useParams } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { useCoreWorkflowByIdShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowByIdShowPageResource';
import { useRefetchCoreRecordOnWorkspaceRecordLifecycleChange } from '@/object-core/hooks/useRefetchCoreRecordOnWorkspaceRecordLifecycleChange';
import { RecordShowPageShell } from '@/object-record/record-show/components/RecordShowPageShell';

export const WorkflowCoreShowPage = () => {
  const { coreWorkflowId = '' } = useParams<{ coreWorkflowId: string }>();

  const { record, loading, error, refetch } =
    useCoreWorkflowByIdShowPageResource({ coreWorkflowId });

  const workspaceWorkflowId = record?.workspaceWorkflowId;

  useRefetchCoreRecordOnWorkspaceRecordLifecycleChange({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordId: isNonEmptyString(workspaceWorkflowId) ? workspaceWorkflowId : '',
    refetch,
  });

  if (!loading && !isDefined(error) && !isDefined(record)) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <RecordShowPageShell
      objectNameSingular={CoreObjectNameSingular.Workflow}
      objectRecordId={coreWorkflowId}
      sseRecordId={
        isNonEmptyString(workspaceWorkflowId) ? workspaceWorkflowId : undefined
      }
      record={record}
      loading={loading}
      error={error}
    />
  );
};
