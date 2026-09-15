import { CoreObjectNameSingular } from 'twenty-shared/types';

import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { useRefetchCoreRecordOnWorkspaceRecordLifecycleChange } from '@/object-core/hooks/useRefetchCoreRecordOnWorkspaceRecordLifecycleChange';
import { isCoreRecordAbsent } from '@/object-core/utils/isCoreRecordAbsent';
import { RecordShowPageShell } from '@/object-record/record-show/components/RecordShowPageShell';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';

type WorkflowCoreShowPageProps = CoreObjectShowPageProps;

export const WorkflowCoreShowPage = ({
  objectRecordId,
}: WorkflowCoreShowPageProps) => {
  const coreWorkflowResult = useCoreWorkflowShowPageResource({
    workspaceWorkflowId: objectRecordId,
  });

  useRefetchCoreRecordOnWorkspaceRecordLifecycleChange({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordId: objectRecordId,
    refetch: coreWorkflowResult.refetch,
  });

  const isCoreWorkflowAbsent = isCoreRecordAbsent(coreWorkflowResult);

  const workspaceResult = useRecordShowPageResource({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordId: objectRecordId,
    skip: !isCoreWorkflowAbsent,
  });

  const { record, loading, error } = isCoreWorkflowAbsent
    ? workspaceResult
    : coreWorkflowResult;

  return (
    <RecordShowPageShell
      objectNameSingular={CoreObjectNameSingular.Workflow}
      objectRecordId={objectRecordId}
      record={record}
      loading={loading}
      error={error}
    />
  );
};
