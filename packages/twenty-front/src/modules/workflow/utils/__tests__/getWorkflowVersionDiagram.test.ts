import { getWorkflowVersionDiagram } from '../getWorkflowVersionDiagram';

describe('getWorkflowVersionDiagram', () => {
  it('returns an empty diagram if the provided workflow version', () => {
    const result = getWorkflowVersionDiagram(undefined);

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('returns a diagram with an empty-trigger node if the provided workflow version has no trigger', () => {
    const result = getWorkflowVersionDiagram({
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
      createdAt: '',
      id: '1',
      name: '',
      steps: [],
      trigger: null,
      updatedAt: '',
      workflowId: '',
    });

    expect(result).toEqual({
      nodes: [
        {
          data: {},
          id: 'trigger',
          position: { x: 0, y: 0 },
          type: 'empty-trigger',
        },
      ],
      edges: [],
    });
  });

  it('returns a diagram with an empty-trigger node if the provided workflow version has no steps', () => {
    const result = getWorkflowVersionDiagram({
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
      createdAt: '',
      id: '1',
      name: '',
      steps: null,
      trigger: {
        settings: { eventName: 'company.created' },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    });

    expect(result).toEqual({
      nodes: [
        {
          data: {
            label: 'Company is Created',
            nodeType: 'trigger',
          },
          id: 'trigger',
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
    });
  });

  it('returns the diagram for the last version', () => {
    const result = getWorkflowVersionDiagram({
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
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
            input: {
              serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
            },
          },
          type: 'CODE',
          valid: true,
        },
      ],
      trigger: {
        settings: { eventName: 'company.created' },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    });

    // Corresponds to the trigger + 1 step
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });
});
