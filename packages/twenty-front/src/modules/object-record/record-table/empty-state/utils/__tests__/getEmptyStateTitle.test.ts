import { getEmptyStateTitle } from '../getEmptyStateTitle';

describe('getEmptyStateTitle', () => {
  it('should return the correct title for workflow version', () => {
    const title = getEmptyStateTitle('workflowVersion', 'Workflow Version');
    expect(title).toBe('No workflow versions yet.');
  });

  it('should return the correct title for workflow run', () => {
    const title = getEmptyStateTitle('workflowRun', 'Workflow Run');
    expect(title).toBe('No workflow runs yet.');
  });

  it('should return the correct title for other object', () => {
    const title = getEmptyStateTitle('object', 'Object');
    expect(title).toBe('Add your first Object');
  });
});
