import { getSortedNonSystemAgents } from '@/object-core/agents/utils/getSortedNonSystemAgents';

describe('getSortedNonSystemAgents', () => {
  it('should drop system agents and sort the rest by label', () => {
    expect(
      getSortedNonSystemAgents([
        { label: 'Workflow Assistant', isSystem: false },
        { label: 'Internal', isSystem: true },
        { label: 'Helper', isSystem: false },
      ]).map(({ label }) => label),
    ).toEqual(['Helper', 'Workflow Assistant']);
  });
});
