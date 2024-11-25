import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { generateWorkflowDiagram } from '../generateWorkflowDiagram';

describe('generateWorkflowDiagram', () => {
  it('should generate a single trigger node when no step is provided', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [];

    const result = generateWorkflowDiagram({ trigger, steps });

    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);

    expect(result.nodes[0]).toMatchObject({
      data: {
        nodeType: 'trigger',
      },
    });
  });

  it('should generate a diagram with nodes and edges corresponding to the steps', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
        settings: {
          errorHandlingOptions: {
            retryOnFailure: { value: true },
            continueOnFailure: { value: false },
          },
          input: {
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
            serverlessFunctionVersion: '1',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
        },
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
        settings: {
          errorHandlingOptions: {
            retryOnFailure: { value: true },
            continueOnFailure: { value: false },
          },
          input: {
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
            serverlessFunctionVersion: '1',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
        },
      },
    ];

    const result = generateWorkflowDiagram({ trigger, steps });

    expect(result.nodes).toHaveLength(steps.length + 1); // All steps + trigger
    expect(result.edges).toHaveLength(steps.length - 1 + 1); // Edges are one less than nodes + the edge from the trigger to the first node

    expect(result.nodes[0].data.nodeType).toBe('trigger');

    const stepNodes = result.nodes.slice(1);

    for (const [index, step] of steps.entries()) {
      expect(stepNodes[index].data).toEqual({
        nodeType: 'action',
        actionType: 'CODE',
        name: step.name,
      });
    }
  });

  it('should correctly link nodes with edges', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
        settings: {
          errorHandlingOptions: {
            retryOnFailure: { value: true },
            continueOnFailure: { value: false },
          },
          input: {
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
            serverlessFunctionVersion: '1',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
        },
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
        settings: {
          errorHandlingOptions: {
            retryOnFailure: { value: true },
            continueOnFailure: { value: false },
          },
          input: {
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
            serverlessFunctionVersion: '1',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
        },
      },
    ];

    const result = generateWorkflowDiagram({ trigger, steps });

    expect(result.edges[0].source).toEqual(result.nodes[0].id);
    expect(result.edges[0].target).toEqual(result.nodes[1].id);

    expect(result.edges[1].source).toEqual(result.nodes[1].id);
    expect(result.edges[1].target).toEqual(result.nodes[2].id);
  });
});
