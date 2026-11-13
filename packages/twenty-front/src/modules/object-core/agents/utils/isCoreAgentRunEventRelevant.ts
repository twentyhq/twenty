import { isDefined } from 'twenty-shared/utils';

import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgentRunBroadcastRecord } from '@/object-core/agents/types/CoreAgentRunBroadcastRecord';

export const isCoreAgentRunEventRelevant = ({
  operation,
  agentId,
}: Pick<
  MetadataOperationBrowserEventDetail<CoreAgentRunBroadcastRecord>,
  'operation'
> & {
  agentId?: string;
}): boolean => {
  if (!isDefined(agentId)) {
    return true;
  }

  // A deleted run no longer says which agent it belonged to
  if (operation.type === 'delete') {
    return true;
  }

  const run =
    operation.type === 'create'
      ? operation.createdRecord
      : operation.updatedRecord;

  return run.agentId === agentId;
};
