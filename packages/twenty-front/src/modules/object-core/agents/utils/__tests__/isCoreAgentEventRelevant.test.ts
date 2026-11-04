import { isCoreAgentEventRelevant } from '@/object-core/agents/utils/isCoreAgentEventRelevant';

const LISTED_AGENTS = [{ id: 'listed-agent' }];

describe('isCoreAgentEventRelevant', () => {
  it('ignores the deletion of an agent the list no longer shows', () => {
    expect(
      isCoreAgentEventRelevant({
        operation: { type: 'delete', deletedRecordId: 'removed-agent' },
        listedAgents: LISTED_AGENTS,
      }),
    ).toBe(false);
  });

  it('refreshes for the deletion of a listed agent and for other changes', () => {
    expect(
      isCoreAgentEventRelevant({
        operation: { type: 'delete', deletedRecordId: 'listed-agent' },
        listedAgents: LISTED_AGENTS,
      }),
    ).toBe(true);
    expect(
      isCoreAgentEventRelevant({
        operation: { type: 'create', createdRecord: { id: 'new-agent' } },
        listedAgents: LISTED_AGENTS,
      }),
    ).toBe(true);
  });
});
