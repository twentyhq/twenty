import { CoreWorkflowsWithCurrentVersionsLoader } from '@/command-menu-item/components/CoreWorkflowsWithCurrentVersionsLoader';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { render, screen } from '@testing-library/react';

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion');

const buildWorkflow = (id: string): WorkflowWithCurrentVersion => ({
  __typename: 'Workflow',
  id,
  name: id,
  statuses: ['DRAFT'],
  lastPublishedVersionId: null,
  versions: [],
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: `${id}-version`,
    workflowId: id,
    name: id,
    status: 'DRAFT',
    trigger: null,
    steps: null,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
});

describe('CoreWorkflowsWithCurrentVersionsLoader', () => {
  it('loads every selected workflow', () => {
    jest
      .mocked(useWorkflowWithCurrentVersion)
      .mockImplementation((workflowId) =>
        workflowId === undefined ? undefined : buildWorkflow(workflowId),
      );

    render(
      <CoreWorkflowsWithCurrentVersionsLoader workflowIds={['first', 'second']}>
        {(workflows) => <div>{workflows.map(({ id }) => id).join(',')}</div>}
      </CoreWorkflowsWithCurrentVersionsLoader>,
    );

    expect(screen.getByText('first,second')).toBeVisible();
  });
});
