import { isWorkflowLayoutManual } from '@/workflow/workflow-diagram/utils/isWorkflowLayoutManual';

const POSITION = { x: 10, y: 20 };

describe('isWorkflowLayoutManual', () => {
  it('returns false when no node has a position', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: { position: undefined },
        steps: [{ id: 'first' }, { id: 'second', position: null }],
      }),
    ).toBe(false);
  });

  it('returns true as soon as one step has a position', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: { position: undefined },
        steps: [{ id: 'first', position: POSITION }, { id: 'second' }],
      }),
    ).toBe(true);
  });

  it('returns true when only the trigger has a position', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: { position: POSITION },
        steps: [{ id: 'first' }],
      }),
    ).toBe(true);
  });

  it('returns false for a missing flow', () => {
    expect(isWorkflowLayoutManual(undefined)).toBe(false);
  });
});
