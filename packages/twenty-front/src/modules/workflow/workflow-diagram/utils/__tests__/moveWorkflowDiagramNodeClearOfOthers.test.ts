import { moveWorkflowDiagramNodeClearOfOthers } from '@/workflow/workflow-diagram/utils/moveWorkflowDiagramNodeClearOfOthers';
import { WORKFLOW_LAYOUT_DEFAULT_OPTIONS } from 'twenty-shared/workflow';

const buildNode = ({
  id,
  position,
  width,
}: {
  id: string;
  position: { x: number; y: number };
  width: number;
}) => ({ id, position, measured: { width, height: 50 } });

describe('moveWorkflowDiagramNodeClearOfOthers', () => {
  it('keeps a node that overlaps nothing where it is', () => {
    expect(
      moveWorkflowDiagramNodeClearOfOthers({
        node: buildNode({ id: 'new', position: { x: 1000, y: 0 }, width: 200 }),
        otherNodes: [
          buildNode({ id: 'placed', position: { x: 0, y: 0 }, width: 200 }),
        ],
        direction: 'right',
      }),
    ).toEqual({ x: 1000, y: 0 });
  });

  it('moves a node past a wider centered node by half of both widths plus the gap', () => {
    const position = moveWorkflowDiagramNodeClearOfOthers({
      node: buildNode({ id: 'new', position: { x: 100, y: 10 }, width: 100 }),
      otherNodes: [
        buildNode({ id: 'placed', position: { x: 0, y: 0 }, width: 400 }),
      ],
      direction: 'right',
    });

    expect(position).toEqual({
      x: 250 + WORKFLOW_LAYOUT_DEFAULT_OPTIONS.nodesep,
      y: 10,
    });
  });

  it('moves a node to the left when the layout puts it on the left', () => {
    const position = moveWorkflowDiagramNodeClearOfOthers({
      node: buildNode({ id: 'new', position: { x: -100, y: 0 }, width: 100 }),
      otherNodes: [
        buildNode({ id: 'placed', position: { x: 0, y: 0 }, width: 400 }),
      ],
      direction: 'left',
    });

    expect(position.x).toBe(-250 - WORKFLOW_LAYOUT_DEFAULT_OPTIONS.nodesep);
  });
});
