import { hasUnpositionedWorkflowNode } from '@/workflow/workflow-diagram/utils/hasUnpositionedWorkflowNode';

const POSITION = { x: 10, y: 20 };

describe('hasUnpositionedWorkflowNode', () => {
  it('returns false when the trigger and every step have a position', () => {
    expect(
      hasUnpositionedWorkflowNode({
        trigger: { position: POSITION },
        steps: [{ position: POSITION }],
      }),
    ).toBe(false);
  });

  it('returns true when a step has no position', () => {
    expect(
      hasUnpositionedWorkflowNode({
        trigger: { position: POSITION },
        steps: [{ position: POSITION }, {}],
      }),
    ).toBe(true);
  });

  it('returns true when the trigger has no position', () => {
    expect(
      hasUnpositionedWorkflowNode({
        trigger: { position: null },
        steps: [{ position: POSITION }],
      }),
    ).toBe(true);
  });

  it('ignores a missing trigger', () => {
    expect(
      hasUnpositionedWorkflowNode({
        trigger: null,
        steps: [{ position: POSITION }],
      }),
    ).toBe(false);
  });
});
