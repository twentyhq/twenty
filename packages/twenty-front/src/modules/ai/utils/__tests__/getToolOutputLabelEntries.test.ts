import { getToolOutputLabelEntries } from '@/ai/utils/getToolOutputLabelEntries';

describe('getToolOutputLabelEntries', () => {
  it('should extract label entries from a learn_tools output', () => {
    const entries = getToolOutputLabelEntries({
      tools: [
        { name: 'find_many_companies', label: 'Search companies' },
        { name: 'create_one_task', label: 'Create task' },
      ],
      notFound: [],
      message: 'Learned 2 tools',
    });

    expect(entries).toEqual([
      { name: 'find_many_companies', label: 'Search companies' },
      { name: 'create_one_task', label: 'Create task' },
    ]);
  });

  it('should extract label entries from a load_skills output', () => {
    const entries = getToolOutputLabelEntries({
      skills: [
        { name: 'data-manipulation', label: 'Data Manipulation' },
        { name: 'workflow-building', label: 'Workflow Building' },
      ],
      message: 'Loaded Data Manipulation, Workflow Building',
    });

    expect(entries).toEqual([
      { name: 'data-manipulation', label: 'Data Manipulation' },
      { name: 'workflow-building', label: 'Workflow Building' },
    ]);
  });

  it('should skip entries without a label', () => {
    const entries = getToolOutputLabelEntries({
      skills: [{ name: 'data-manipulation' }],
    });

    expect(entries).toEqual([]);
  });

  it('should return an empty array for unrelated outputs', () => {
    expect(getToolOutputLabelEntries({ records: [], count: '0' })).toEqual([]);
    expect(getToolOutputLabelEntries(null)).toEqual([]);
    expect(getToolOutputLabelEntries(undefined)).toEqual([]);
    expect(getToolOutputLabelEntries('not an object')).toEqual([]);
  });
});
