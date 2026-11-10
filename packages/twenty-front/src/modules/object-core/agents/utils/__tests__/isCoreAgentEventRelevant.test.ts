import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgentBroadcastRecord } from '@/object-core/agents/types/CoreAgentBroadcastRecord';
import { isCoreAgentEventRelevant } from '@/object-core/agents/utils/isCoreAgentEventRelevant';

const agentUpdated = (
  id: string,
): MetadataOperationBrowserEventDetail<CoreAgentBroadcastRecord> => ({
  metadataName: 'agent',
  operation: { type: 'update', updatedRecord: { id } },
});

const agentDeleted = (
  id: string,
): MetadataOperationBrowserEventDetail<CoreAgentBroadcastRecord> => ({
  metadataName: 'agent',
  operation: { type: 'delete', deletedRecordId: id },
});

describe('isCoreAgentEventRelevant', () => {
  it('accepts every event when no agent is scoped', () => {
    expect(isCoreAgentEventRelevant(agentUpdated('agent-2'), undefined)).toBe(
      true,
    );
  });

  it('accepts an update of the scoped agent', () => {
    expect(isCoreAgentEventRelevant(agentUpdated('agent-1'), 'agent-1')).toBe(
      true,
    );
  });

  it('rejects an update of another agent', () => {
    expect(isCoreAgentEventRelevant(agentUpdated('agent-2'), 'agent-1')).toBe(
      false,
    );
  });

  it('accepts the deletion of the scoped agent', () => {
    expect(isCoreAgentEventRelevant(agentDeleted('agent-1'), 'agent-1')).toBe(
      true,
    );
  });
});
