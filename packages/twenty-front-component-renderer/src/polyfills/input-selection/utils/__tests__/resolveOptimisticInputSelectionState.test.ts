import { resolveOptimisticInputSelectionState } from '../resolveOptimisticInputSelectionState';

describe('resolveOptimisticInputSelectionState', () => {
  it('should return the host state without replaying commands when the value is not text', () => {
    expect(
      resolveOptimisticInputSelectionState({
        hostState: {
          selectionStart: 1,
          selectionEnd: 2,
          selectionDirection: 'forward',
        },
        pendingCommands: [{ sequence: 1, request: { method: 'select' } }],
        value: undefined,
      }),
    ).toEqual({
      selectionStart: 1,
      selectionEnd: 2,
      selectionDirection: 'forward',
    });
  });

  it('should collapse the selection at the start when neither the value nor the host state is known', () => {
    expect(
      resolveOptimisticInputSelectionState({
        hostState: undefined,
        pendingCommands: [],
        value: undefined,
      }),
    ).toEqual({
      selectionStart: 0,
      selectionEnd: 0,
      selectionDirection: 'none',
    });
  });
});
