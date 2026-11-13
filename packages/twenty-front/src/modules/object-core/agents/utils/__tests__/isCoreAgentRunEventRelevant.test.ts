import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgentRunBroadcastRecord } from '@/object-core/agents/types/CoreAgentRunBroadcastRecord';
import { isCoreAgentRunEventRelevant } from '@/object-core/agents/utils/isCoreAgentRunEventRelevant';

const runUpdated = (
  agentId: string | null,
): MetadataOperationBrowserEventDetail<CoreAgentRunBroadcastRecord> => ({
  metadataName: 'agentTurn',
  operation: { type: 'update', updatedRecord: { id: 'run-id', agentId } },
});

const runDeleted: MetadataOperationBrowserEventDetail<CoreAgentRunBroadcastRecord> =
  {
    metadataName: 'agentTurn',
    operation: { type: 'delete', deletedRecordId: 'run-id' },
  };

describe('isCoreAgentRunEventRelevant', () => {
  it('accepts every run when no agent is scoped', () => {
    expect(isCoreAgentRunEventRelevant(runUpdated('agent-2'), undefined)).toBe(
      true,
    );
  });

  it('accepts a run of the scoped agent', () => {
    expect(isCoreAgentRunEventRelevant(runUpdated('agent-1'), 'agent-1')).toBe(
      true,
    );
  });

  it('rejects a run of another agent', () => {
    expect(isCoreAgentRunEventRelevant(runUpdated('agent-2'), 'agent-1')).toBe(
      false,
    );
  });

  it('rejects a run without an agent', () => {
    expect(isCoreAgentRunEventRelevant(runUpdated(null), 'agent-1')).toBe(
      false,
    );
  });

  it('accepts a deleted run, whose agent is unknown', () => {
    expect(isCoreAgentRunEventRelevant(runDeleted, 'agent-1')).toBe(true);
  });
});
