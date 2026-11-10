import { isWorkflowLayoutManual } from '@/workflow/workflow-diagram/utils/isWorkflowLayoutManual';

const POSITION = { x: 10, y: 20 };

describe('isWorkflowLayoutManual', () => {
  it('returns true when the trigger and every step have a position', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: { position: POSITION },
        steps: [{ position: POSITION }, { position: POSITION }],
      }),
    ).toBe(true);
  });

  it('returns false as soon as one step has no position', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: { position: POSITION },
        steps: [{ position: POSITION }, { position: undefined }],
      }),
    ).toBe(false);
  });

  it('returns false when the trigger has no position', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: { position: undefined },
        steps: [{ position: POSITION }],
      }),
    ).toBe(false);
  });

  it('ignores a missing trigger', () => {
    expect(
      isWorkflowLayoutManual({
        trigger: null,
        steps: [{ position: POSITION }],
      }),
    ).toBe(true);
  });
});
