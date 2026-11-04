import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';

export const isCoreAgentEventRelevant = ({
  operation,
  listedAgents,
}: {
  operation: MetadataOperation<Pick<CoreAgent, 'id'>>;
  listedAgents: Pick<CoreAgent, 'id'>[];
}): boolean =>
  operation.type !== 'delete' ||
  listedAgents.some(({ id }) => id === operation.deletedRecordId);
