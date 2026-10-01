import { Navigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/primitives/feedback';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type Workflow } from '@/workflow/types/Workflow';

export const CoreWorkflowToWorkspaceRedirect = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const { records, loading } = useFindManyRecords<
    Pick<Workflow, 'id' | '__typename'> & { coreWorkflowId: string | null }
  >({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    filter: { coreWorkflowId: { eq: coreWorkflowId } },
    recordGqlFields: { id: true, coreWorkflowId: true },
  });

  if (loading) {
    return <Loader />;
  }

  const workspaceWorkflowId = records[0]?.id;

  if (!isDefined(workspaceWorkflowId)) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <Navigate
      replace
      to={getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workspaceWorkflowId,
      })}
    />
  );
};
