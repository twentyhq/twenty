import { isDefined } from 'twenty-shared/utils';

import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgentBroadcastRecord } from '@/object-core/agents/types/CoreAgentBroadcastRecord';

export const isCoreAgentEventRelevant = (
  { operation }: MetadataOperationBrowserEventDetail<CoreAgentBroadcastRecord>,
  coreAgentId?: string,
): boolean => {
  if (!isDefined(coreAgentId)) {
    return true;
  }

  if (operation.type === 'delete') {
    return operation.deletedRecordId === coreAgentId;
  }

  const record =
    operation.type === 'create'
      ? operation.createdRecord
      : operation.updatedRecord;

  return record.id === coreAgentId;
};
