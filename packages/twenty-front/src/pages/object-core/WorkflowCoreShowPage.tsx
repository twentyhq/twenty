import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { RecordShowPageShell } from '@/object-record/record-show/components/RecordShowPageShell';
import { useRecordShowPageOperationSignature } from '@/object-record/record-show/hooks/useRecordShowPageOperationSignature';

export const WorkflowCoreShowPage = ({
  objectRecordId,
}: CoreObjectShowPageProps) => {
  const coreWorkflowResult = useCoreWorkflowShowPageResource({
    workspaceWorkflowId: objectRecordId,
    skip: false,
  });

  const isCoreWorkflowMissing =
    !coreWorkflowResult.loading && !isDefined(coreWorkflowResult.record);

  const operationSignature = useRecordShowPageOperationSignature({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const workspaceResult = useFindOneRecord({
    objectRecordId,
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordGqlFields: operationSignature.fields,
    withSoftDeleted: true,
    skip: !isCoreWorkflowMissing,
  });

  const { record, loading, error } = isCoreWorkflowMissing
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
