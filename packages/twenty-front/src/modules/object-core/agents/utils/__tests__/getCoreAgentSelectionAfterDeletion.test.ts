import { getCoreAgentSelectionAfterDeletion } from '@/object-core/agents/utils/getCoreAgentSelectionAfterDeletion';

describe('getCoreAgentSelectionAfterDeletion', () => {
  it('retains failed deletions and agents selected after the request started', () => {
    const filterSettings = {};
    const selection = {
      filterSettings,
      rowIds: ['deleted-agent', 'failed-agent', 'new-selection'],
    };
    const reconciledSelection = getCoreAgentSelectionAfterDeletion({
      selection,
      deletedAgentIds: ['deleted-agent'],
    });

    expect(reconciledSelection).toEqual({
      filterSettings,
      rowIds: ['failed-agent', 'new-selection'],
    });
    expect(reconciledSelection.filterSettings).toBe(filterSettings);
    expect(selection.rowIds).toEqual([
      'deleted-agent',
      'failed-agent',
      'new-selection',
    ]);
  });
});
