import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreWorkflowBroadcastRecord } from '@/object-core/workflows/types/CoreWorkflowBroadcastRecord';
import { isDefined } from 'twenty-shared/utils';

export const isCoreWorkflowEventRelevant = (
  detail: MetadataOperationBrowserEventDetail<CoreWorkflowBroadcastRecord>,
  coreWorkflowId?: string,
): boolean => {
  if (!isDefined(coreWorkflowId)) {
    return true;
  }

  const isWorkflowVersionEvent = detail.metadataName === 'workflowVersion';

  if (detail.operation.type === 'delete') {
    return (
      isWorkflowVersionEvent ||
      detail.operation.deletedRecordId === coreWorkflowId
    );
  }

  const record =
    detail.operation.type === 'create'
      ? detail.operation.createdRecord
      : detail.operation.updatedRecord;

  if (!isWorkflowVersionEvent) {
    return record.id === coreWorkflowId;
  }

  return (
    !isDefined(record.coreWorkflowId) ||
    record.coreWorkflowId === coreWorkflowId
  );
};
