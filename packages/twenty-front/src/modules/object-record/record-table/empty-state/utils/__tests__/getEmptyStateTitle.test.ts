import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getEmptyStateTitle } from '@/object-record/record-table/empty-state/utils/getEmptyStateTitle';

describe('getEmptyStateTitle', () => {
  it('should return the correct title for workflow version', () => {
    const title = getEmptyStateTitle(
      CoreObjectNameSingular.WorkflowVersion,
      'Workflow Version',
    );
    expect(title).toBe('No workflow versions yet');
  });

  it('should return the correct title for workflow run', () => {
    const title = getEmptyStateTitle(
      CoreObjectNameSingular.WorkflowRun,
      'Workflow Run',
    );
    expect(title).toBe('No workflow runs yet');
  });

  it('should return the correct title for other object', () => {
    const title = getEmptyStateTitle('object', 'Object');
    expect(title).toBe('Add your first Object');
  });
});
