import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getDisplayedWorkflowDiagram } from '@/workflow/workflow-diagram/utils/getDisplayedWorkflowDiagram';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const STORED_POSITION = { x: 999, y: 999 };

const buildNode = (id: string, extra: object = {}) => ({
  id,
  position: STORED_POSITION,
  data: {
    nodeType: 'action' as const,
    actionType: 'CODE' as const,
    name: id,
    hasNextStepIds: false,
    stepId: id,
  },
  ...extra,
});

const diagram: WorkflowDiagram = {
  nodes: [
    buildNode(TRIGGER_STEP_ID),
    buildNode('if-branch'),
    buildNode('else-branch'),
  ],
  edges: [
    {
      id: 'trigger-to-if',
      source: TRIGGER_STEP_ID,
      sourceHandle: 'source',
      target: 'if-branch',
      targetHandle: 'target',
    },
    {
      id: 'trigger-to-else',
      source: TRIGGER_STEP_ID,
      sourceHandle: 'source',
      target: 'else-branch',
      targetHandle: 'target',
    },
  ],
};

describe('getDisplayedWorkflowDiagram', () => {
  it('keeps stored positions when every node has one', () => {
    expect(
      getDisplayedWorkflowDiagram({
        diagram,
        flow: {
          trigger: { position: STORED_POSITION },
          steps: [{ position: STORED_POSITION }, { position: STORED_POSITION }],
        },
      }),
    ).toBe(diagram);
  });

  it('lays the diagram out when a node has no stored position', () => {
    const { nodes } = getDisplayedWorkflowDiagram({
      diagram,
      flow: {
        trigger: { position: STORED_POSITION },
        steps: [{ position: STORED_POSITION }, { position: undefined }],
      },
    });

    const [trigger, ifBranch, elseBranch] = nodes;

    expect(trigger.position.x).toBe(0);
    expect(ifBranch.position.y).toBeGreaterThan(trigger.position.y);
    expect(ifBranch.position.y).toBe(elseBranch.position.y);
    expect(ifBranch.position.x).toBeLessThan(trigger.position.x);
    expect(elseBranch.position.x).toBeGreaterThan(trigger.position.x);
  });

  it('leaves a node being dragged where the user holds it', () => {
    const { nodes } = getDisplayedWorkflowDiagram({
      diagram: {
        ...diagram,
        nodes: diagram.nodes.map((node) =>
          node.id === 'if-branch' ? { ...node, dragging: true } : node,
        ),
      },
      flow: { trigger: { position: undefined }, steps: [] },
    });

    expect(nodes[1].position).toEqual(STORED_POSITION);
    expect(nodes[2].position).not.toEqual(STORED_POSITION);
  });
});
