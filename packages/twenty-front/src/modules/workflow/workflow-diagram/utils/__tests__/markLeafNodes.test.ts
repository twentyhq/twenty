import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { markLeafNodes } from '../markLeafNodes';

describe('markLeafNodes', () => {
  const createTrigger = (): WorkflowTrigger => ({
    name: 'Company created',
    type: 'DATABASE_EVENT',
    settings: {
      eventName: 'company.created',
      outputSchema: {},
    },
  });

  const createStep = (id: string): WorkflowStep => ({
    id,
    name: `Step ${id}`,
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
  });

  it('handles empty workflow with only trigger', () => {
    const trigger = createTrigger();
    const steps: WorkflowStep[] = [];

    const diagram = generateWorkflowDiagram({ trigger, steps });
    const diagramWithLeafNodes = markLeafNodes(diagram);

    expect(diagramWithLeafNodes.nodes).toHaveLength(1);
    expect(diagramWithLeafNodes.nodes[0].data.isLeafNode).toBe(true);
  });

  it('handles workflow with single step', () => {
    const trigger = createTrigger();
    const steps = [createStep('step1')];

    const diagram = generateWorkflowDiagram({ trigger, steps });
    const diagramWithLeafNodes = markLeafNodes(diagram);

    expect(diagramWithLeafNodes.nodes).toHaveLength(2);
    expect(diagramWithLeafNodes.nodes[0].data.isLeafNode).toBe(false);
    expect(diagramWithLeafNodes.nodes[1].data.isLeafNode).toBe(true);
  });

  it('handles workflow with two steps', () => {
    const trigger = createTrigger();
    const steps = [createStep('step1'), createStep('step2')];

    const diagram = generateWorkflowDiagram({ trigger, steps });
    const diagramWithLeafNodes = markLeafNodes(diagram);

    expect(diagramWithLeafNodes.nodes).toHaveLength(3);
    expect(diagramWithLeafNodes.nodes[0].data.isLeafNode).toBe(false);
    expect(diagramWithLeafNodes.nodes[1].data.isLeafNode).toBe(false);
    expect(diagramWithLeafNodes.nodes[2].data.isLeafNode).toBe(true);
  });
});
