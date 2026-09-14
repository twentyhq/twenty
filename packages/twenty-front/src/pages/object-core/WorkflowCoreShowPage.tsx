import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { RecordShowPageShell } from '@/object-record/record-show/components/RecordShowPageShell';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';

export const WorkflowCoreShowPage = ({
  objectRecordId,
}: CoreObjectShowPageProps) => {
  const coreWorkflowResult = useCoreWorkflowShowPageResource({
    workspaceWorkflowId: objectRecordId,
  });

  const isCoreWorkflowAbsent =
    !coreWorkflowResult.loading &&
    !isDefined(coreWorkflowResult.error) &&
    !isDefined(coreWorkflowResult.record);

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
