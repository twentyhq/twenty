import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getDisplayedWorkflowDiagram } from '@/workflow/workflow-diagram/utils/getDisplayedWorkflowDiagram';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const TRIGGER_POSITION = { x: 500, y: 100 };
const IF_BRANCH_POSITION = { x: 300, y: 400 };
const PLACEHOLDER_POSITION = { x: 0, y: 0 };

const buildNode = (id: string, position: { x: number; y: number }) => ({
  id,
  position,
  data: {
    nodeType: 'action' as const,
    actionType: 'CODE' as const,
    name: id,
    hasNextStepIds: false,
    stepId: id,
  },
});

const buildEdge = (source: string, target: string) => ({
  id: `${source}-to-${target}`,
  source,
  sourceHandle: 'source',
  target,
  targetHandle: 'target',
});

const diagram: WorkflowDiagram = {
  nodes: [
    buildNode(TRIGGER_STEP_ID, TRIGGER_POSITION),
    buildNode('if-branch', IF_BRANCH_POSITION),
    buildNode('else-branch', PLACEHOLDER_POSITION),
  ],
  edges: [
    buildEdge(TRIGGER_STEP_ID, 'if-branch'),
    buildEdge(TRIGGER_STEP_ID, 'else-branch'),
  ],
};

describe('getDisplayedWorkflowDiagram', () => {
  it('keeps stored positions when every node has one', () => {
    expect(
      getDisplayedWorkflowDiagram({
        diagram,
        flow: {
          trigger: { position: TRIGGER_POSITION },
          steps: [
            { id: 'if-branch', position: IF_BRANCH_POSITION },
            { id: 'else-branch', position: PLACEHOLDER_POSITION },
          ],
        },
      }),
    ).toBe(diagram);
  });

  it('lays the whole diagram out when no node has a stored position', () => {
    const { nodes } = getDisplayedWorkflowDiagram({
      diagram,
      flow: {
        trigger: { position: undefined },
        steps: [{ id: 'if-branch' }, { id: 'else-branch' }],
      },
    });

    const [trigger, ifBranch, elseBranch] = nodes;

    expect(trigger.position.x).toBe(0);
    expect(ifBranch.position.y).toBeGreaterThan(trigger.position.y);
    expect(ifBranch.position.y).toBe(elseBranch.position.y);
    expect(ifBranch.position.x).toBeLessThan(trigger.position.x);
    expect(elseBranch.position.x).toBeGreaterThan(trigger.position.x);
  });

  it('places only the unpositioned node, next to its parent', () => {
    const { nodes } = getDisplayedWorkflowDiagram({
      diagram,
      flow: {
        trigger: { position: TRIGGER_POSITION },
        steps: [
          { id: 'if-branch', position: IF_BRANCH_POSITION },
          { id: 'else-branch' },
        ],
      },
    });

    const [trigger, ifBranch, elseBranch] = nodes;

    expect(trigger.position).toEqual(TRIGGER_POSITION);
    expect(ifBranch.position).toEqual(IF_BRANCH_POSITION);
    expect(elseBranch.position.y).toBeGreaterThan(TRIGGER_POSITION.y);
    expect(elseBranch.position.x).toBeGreaterThan(TRIGGER_POSITION.x);
  });

  it('places a chain of unpositioned nodes from the closest positioned one', () => {
    const { nodes } = getDisplayedWorkflowDiagram({
      diagram: {
        nodes: [
          buildNode(TRIGGER_STEP_ID, TRIGGER_POSITION),
          buildNode('first', PLACEHOLDER_POSITION),
          buildNode('second', PLACEHOLDER_POSITION),
        ],
        edges: [
          buildEdge(TRIGGER_STEP_ID, 'first'),
          buildEdge('first', 'second'),
        ],
      },
      flow: {
        trigger: { position: TRIGGER_POSITION },
        steps: [{ id: 'first' }, { id: 'second' }],
      },
    });

    const [trigger, first, second] = nodes;

    expect(first.position.x).toBe(trigger.position.x);
    expect(second.position.x).toBe(trigger.position.x);
    expect(first.position.y).toBeGreaterThan(trigger.position.y);
    expect(second.position.y).toBeGreaterThan(first.position.y);
  });

  it('places a node with no positioned neighbour from another positioned node', () => {
    const { nodes } = getDisplayedWorkflowDiagram({
      diagram: {
        nodes: [
          buildNode(TRIGGER_STEP_ID, TRIGGER_POSITION),
          buildNode('detached', PLACEHOLDER_POSITION),
        ],
        edges: [],
      },
      flow: {
        trigger: { position: TRIGGER_POSITION },
        steps: [{ id: 'detached' }],
      },
    });

    expect(nodes[1].position).not.toEqual(PLACEHOLDER_POSITION);
  });

  it('leaves a node being dragged where the user holds it', () => {
    const draggedDiagram = {
      ...diagram,
      nodes: diagram.nodes.map((node) =>
        node.id === 'else-branch' ? { ...node, dragging: true } : node,
      ),
    };

    expect(
      getDisplayedWorkflowDiagram({
        diagram: draggedDiagram,
        flow: {
          trigger: { position: undefined },
          steps: [{ id: 'if-branch' }, { id: 'else-branch' }],
        },
      }).nodes[2].position,
    ).toEqual(PLACEHOLDER_POSITION);

    expect(
      getDisplayedWorkflowDiagram({
        diagram: draggedDiagram,
        flow: {
          trigger: { position: TRIGGER_POSITION },
          steps: [
            { id: 'if-branch', position: IF_BRANCH_POSITION },
            { id: 'else-branch' },
          ],
        },
      }).nodes[2].position,
    ).toEqual(PLACEHOLDER_POSITION);
  });
});
