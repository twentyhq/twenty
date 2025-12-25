import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';

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

    const result = generateWorkflowDiagram({
      trigger,
      steps,
      workflowContext: 'workflow',
    });

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
      nextStepIds: ['step1'],
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
        nextStepIds: ['step2'],
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
        nextStepIds: undefined,
      },
    ];

    const result = generateWorkflowDiagram({
      trigger,
      steps,
      workflowContext: 'workflow',
    });

    expect(result.nodes).toHaveLength(steps.length + 1); // All steps + trigger
    expect(result.edges).toHaveLength(steps.length - 1 + 1); // Edges are one less than nodes + the edge from the trigger to the first node

    expect(result.nodes[0].data.nodeType).toBe('trigger');

    const stepNodes = result.nodes.slice(1);

    for (const [index, step] of steps.entries()) {
      expect(stepNodes[index].data).toEqual({
        nodeType: 'action',
        actionType: 'CODE',
        name: step.name,
        hasNextStepIds: step.id !== 'step2',
        stepId: step.id,
        position: {
          x: 0,
          y: 150 * (index + 1),
        },
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
      nextStepIds: ['step1'],
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
        nextStepIds: ['step2'],
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
        nextStepIds: undefined,
      },
    ];

    const result = generateWorkflowDiagram({
      trigger,
      steps,
      workflowContext: 'workflow',
    });

    expect(result.edges.length).toEqual(2);
    expect(result.nodes.length).toEqual(3);

    expect(result.edges[0].source).toEqual('trigger');
    expect(result.edges[0].target).toEqual('step1');

    expect(result.edges[1].source).toEqual('step1');
    expect(result.edges[1].target).toEqual('step2');
  });

  it('should take nextStepIds into account', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
      nextStepIds: ['step2'],
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
        nextStepIds: undefined,
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
        nextStepIds: ['step1'],
      },
    ];

    const result = generateWorkflowDiagram({
      trigger,
      steps,
      workflowContext: 'workflow',
    });

    expect(result.edges.length).toEqual(2);
    expect(result.nodes.length).toEqual(3);

    expect(result.edges[0].source).toEqual('trigger');
    expect(result.edges[0].target).toEqual('step2');

    expect(result.edges[1].source).toEqual('step2');
    expect(result.edges[1].target).toEqual('step1');
  });

  it('should take nextStepIds into account for complex diagram', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
      nextStepIds: ['step2', 'step3'],
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
        nextStepIds: undefined,
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
        nextStepIds: ['step1'],
      },
      {
        id: 'step3',
        name: 'Step 3',
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
        nextStepIds: ['step1'],
      },
    ];

    const result = generateWorkflowDiagram({
      trigger,
      steps,
      workflowContext: 'workflow',
    });

    expect(result.edges.length).toEqual(4);
    expect(result.nodes.length).toEqual(4);

    expect(result.edges[0].source).toEqual('trigger');
    expect(result.edges[0].target).toEqual('step2');

    expect(result.edges[1].source).toEqual('trigger');
    expect(result.edges[1].target).toEqual('step3');

    expect(result.edges[2].source).toEqual('step2');
    expect(result.edges[2].target).toEqual('step1');

    expect(result.edges[3].source).toEqual('step3');
    expect(result.edges[3].target).toEqual('step1');
  });
});
