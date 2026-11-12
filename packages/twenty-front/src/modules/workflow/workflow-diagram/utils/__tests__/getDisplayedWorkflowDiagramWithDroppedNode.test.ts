import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getDisplayedWorkflowDiagramWithDroppedNode } from '@/workflow/workflow-diagram/utils/getDisplayedWorkflowDiagramWithDroppedNode';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const TRIGGER_POSITION = { x: 500, y: 100 };
const DROP_POSITION = { x: 1200, y: 600 };

const buildNode = ({
  id,
  position,
}: {
  id: string;
  position: { x: number; y: number };
}) => ({
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

const buildEdge = ({ source, target }: { source: string; target: string }) => ({
  id: `${source}-to-${target}`,
  source,
  sourceHandle: 'source',
  target,
  targetHandle: 'target',
});

const diagram: WorkflowDiagram = {
  nodes: [
    buildNode({ id: TRIGGER_STEP_ID, position: TRIGGER_POSITION }),
    buildNode({ id: 'new-branch', position: DROP_POSITION }),
    buildNode({ id: 'new-branch-child', position: { x: 0, y: 0 } }),
  ],
  edges: [
    buildEdge({ source: TRIGGER_STEP_ID, target: 'new-branch' }),
    buildEdge({ source: 'new-branch', target: 'new-branch-child' }),
  ],
};

describe('getDisplayedWorkflowDiagramWithDroppedNode', () => {
  it('keeps the dropped node where it was dropped and places its new children from there', () => {
    const { nodes } = getDisplayedWorkflowDiagramWithDroppedNode({
      diagram,
      flow: {
        trigger: { position: TRIGGER_POSITION },
        steps: [{ id: 'new-branch' }, { id: 'new-branch-child' }],
      },
      droppedNode: { id: 'new-branch', position: DROP_POSITION },
    });

    const [trigger, newBranch, newBranchChild] = nodes;

    expect(trigger.position).toEqual(TRIGGER_POSITION);
    expect(newBranch.position).toEqual(DROP_POSITION);
    expect(newBranch.dragging).toBe(false);
    expect(newBranchChild.position.x).toBe(DROP_POSITION.x);
    expect(newBranchChild.position.y).toBeGreaterThan(DROP_POSITION.y);
  });

  it('keeps the dropped node where it was dropped in an automatic layout', () => {
    const { nodes } = getDisplayedWorkflowDiagramWithDroppedNode({
      diagram,
      flow: {
        trigger: { position: undefined },
        steps: [{ id: 'new-branch' }, { id: 'new-branch-child' }],
      },
      droppedNode: { id: 'new-branch', position: DROP_POSITION },
    });

    expect(nodes[1].position).toEqual(DROP_POSITION);
  });
});
