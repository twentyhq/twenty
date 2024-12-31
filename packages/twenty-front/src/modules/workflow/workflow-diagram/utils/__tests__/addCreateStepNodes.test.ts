import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { addCreateStepNodes } from '../addCreateStepNodes';

describe('addCreateStepNodes', () => {
  it("adds a create step node to the end of a single-branch flow and doesn't change the shape of other nodes", () => {
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

    const diagramInitial = generateWorkflowDiagram({ trigger, steps });

    expect(diagramInitial.nodes).toHaveLength(3);
    expect(diagramInitial.edges).toHaveLength(2);

    const diagramWithCreateStepNodes = addCreateStepNodes(diagramInitial);

    expect(diagramWithCreateStepNodes.nodes).toHaveLength(4);
    expect(diagramWithCreateStepNodes.edges).toHaveLength(3);

    expect(diagramWithCreateStepNodes.nodes[0].type).toBe(undefined);
    expect(diagramWithCreateStepNodes.nodes[0].data.nodeType).toBe('trigger');

    expect(diagramWithCreateStepNodes.nodes[1].type).toBe(undefined);
    expect(diagramWithCreateStepNodes.nodes[1].data.nodeType).toBe('action');

    expect(diagramWithCreateStepNodes.nodes[2].type).toBe(undefined);
    expect(diagramWithCreateStepNodes.nodes[2].data.nodeType).toBe('action');

    expect(diagramWithCreateStepNodes.nodes[3].type).toBe('create-step');
  });
});
