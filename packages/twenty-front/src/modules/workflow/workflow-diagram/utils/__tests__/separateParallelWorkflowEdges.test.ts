import {
  type WorkflowIfElseAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { Position } from '@xyflow/react';

const branchStep: WorkflowIfElseAction = {
  id: 'if-else',
  name: 'If/Else',
  type: 'IF_ELSE',
  valid: true,
  settings: {
    input: {
      stepFilters: [],
      stepFilterGroups: [],
      branches: [
        { id: 'if', filterGroupId: 'if-filter', nextStepIds: ['target'] },
        {
          id: 'else-if',
          filterGroupId: 'else-if-filter',
          nextStepIds: ['target'],
        },
        { id: 'else', nextStepIds: ['target'] },
      ],
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const targetStep: WorkflowStep = {
  id: 'target',
  name: 'Target',
  type: 'EMPTY',
  valid: true,
  settings: { ...branchStep.settings, input: {} },
};

describe('parallel workflow branches', () => {
  it.each<WorkflowContext>(['workflow', 'workflow-version', 'workflow-run'])(
    'gives branches distinct paths, controls, and reconnect ports in %s',
    (workflowContext) => {
      const diagram = generateWorkflowDiagram({
        trigger: undefined,
        steps: [branchStep, targetStep],
        workflowContext,
      });

      expect(new Set(diagram.edges.map((edge) => edge.targetHandle)).size).toBe(
        3,
      );
      expect(
        diagram.nodes.find((node) => node.id === 'target')?.data,
      ).toMatchObject({
        targetHandleIds: diagram.edges.map((edge) => edge.targetHandle),
      });
      expect(
        diagram.edges.map((edge) => edge.data?.sourceConnectionOptions),
      ).toEqual(
        branchStep.settings.input.branches.map((branch) => ({
          connectedStepType: 'IF_ELSE',
          settings: { branchId: branch.id },
        })),
      );
      expect(diagram.edges.map((edge) => edge.data?.edgePathStrategy)).toEqual([
        'parallel-edge',
        'parallel-edge',
        'parallel-edge',
      ]);

      for (const targetY of [200, 50]) {
        const paths = diagram.edges.map((edge) =>
          getEdgePath({
            sourceX: 100,
            sourceY: 100,
            sourcePosition: Position.Bottom,
            targetX: 100,
            targetY,
            targetPosition: Position.Top,
            strategy: edge.data?.edgePathStrategy,
            parallelEdgeOffset: edge.data?.parallelEdgeOffset,
          }),
        );
        expect(new Set(paths.map((path) => path.overlayPosition[0])).size).toBe(
          3,
        );
        expect(new Set(paths.map((path) => path.segments[0].path)).size).toBe(
          3,
        );
      }
    },
  );

  it('keeps handle identities stable when the diagram is regenerated', () => {
    const generate = () =>
      generateWorkflowDiagram({
        trigger: undefined,
        steps: [branchStep, targetStep],
        workflowContext: 'workflow',
      });
    expect(generate().edges.map((edge) => edge.targetHandle)).toEqual(
      generate().edges.map((edge) => edge.targetHandle),
    );
  });

  it('gives repeated connections stable, distinct target handles', () => {
    const repeatedBranchStep: WorkflowIfElseAction = {
      ...branchStep,
      settings: {
        ...branchStep.settings,
        input: {
          ...branchStep.settings.input,
          branches: [
            {
              ...branchStep.settings.input.branches[0],
              nextStepIds: ['target', 'target'],
            },
          ],
        },
      },
    };
    const generate = () =>
      generateWorkflowDiagram({
        trigger: undefined,
        steps: [repeatedBranchStep, targetStep],
        workflowContext: 'workflow',
      });
    const targetHandles = generate().edges.map((edge) => edge.targetHandle);

    expect(new Set(targetHandles).size).toBe(2);
    expect(targetHandles).toEqual(
      generate().edges.map((edge) => edge.targetHandle),
    );
  });

  it('keeps other incoming connections separate from the shared branches', () => {
    const diagram = generateWorkflowDiagram({
      trigger: {
        type: 'MANUAL',
        name: 'Trigger',
        settings: { outputSchema: {} },
        nextStepIds: ['target'],
      },
      steps: [branchStep, targetStep],
      workflowContext: 'workflow',
    });

    expect(new Set(diagram.edges.map((edge) => edge.targetHandle)).size).toBe(
      4,
    );
    expect(diagram.edges[0].data?.parallelEdgeOffset).toBeUndefined();
    expect(diagram.edges[0].data?.edgePathStrategy).toBeUndefined();
  });

  it('restores default routing once branches no longer share a destination', () => {
    const separatedBranchStep: WorkflowIfElseAction = {
      ...branchStep,
      settings: {
        ...branchStep.settings,
        input: {
          ...branchStep.settings.input,
          branches: branchStep.settings.input.branches.map((branch) => ({
            ...branch,
            nextStepIds: [branch.id],
          })),
        },
      },
    };
    const diagram = generateWorkflowDiagram({
      trigger: undefined,
      steps: [
        separatedBranchStep,
        ...['if', 'else-if', 'else'].map((id) => ({ ...targetStep, id })),
      ],
      workflowContext: 'workflow',
    });

    for (const edge of diagram.edges) {
      expect(edge.targetHandle).toBe('default');
      expect(edge.data?.parallelEdgeOffset).toBeUndefined();
    }
    for (const node of diagram.nodes) {
      expect(node.data).not.toHaveProperty('targetHandleIds');
    }
  });
});
