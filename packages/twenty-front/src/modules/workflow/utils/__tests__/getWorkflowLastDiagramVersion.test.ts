import { Workflow } from '@/workflow/types/Workflow';
import { getWorkflowLastDiagramVersion } from '../getWorkflowLastDiagramVersion';

describe('getWorkflowLastDiagramVersion', () => {
  it('returns an empty diagram if the provided workflow is undefined', () => {
    const result = getWorkflowLastDiagramVersion(undefined);

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('returns an empty diagram if the provided workflow has no versions', () => {
    const result = getWorkflowLastDiagramVersion({
      __typename: 'Workflow',
      id: 'aa',
      name: 'aa',
      publishedVersionId: '',
      versions: [],
    });

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('returns the diagram for the last version', () => {
    const workflow: Workflow = {
      __typename: 'Workflow',
      id: 'aa',
      name: 'aa',
      publishedVersionId: '',
      versions: [
        {
          __typename: 'WorkflowVersion',
          createdAt: '',
          id: '1',
          name: '',
          steps: [],
          trigger: {
            settings: { eventName: 'company.created' },
            type: 'DATABASE_EVENT',
          },
          updatedAt: '',
          workflowId: '',
        },
        {
          __typename: 'WorkflowVersion',
          createdAt: '',
          id: '1',
          name: '',
          steps: [
            {
              id: 'step-1',
              name: '',
              settings: {
                errorHandlingOptions: {
                  retryOnFailure: { value: true },
                  continueOnFailure: { value: false },
                },
                serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
              },
              type: 'CODE_ACTION',
              valid: true,
            },
          ],
          trigger: {
            settings: { eventName: 'company.created' },
            type: 'DATABASE_EVENT',
          },
          updatedAt: '',
          workflowId: '',
        },
      ],
    };

    const result = getWorkflowLastDiagramVersion(workflow);

    // Corresponds to the trigger + 1 step
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });
});
