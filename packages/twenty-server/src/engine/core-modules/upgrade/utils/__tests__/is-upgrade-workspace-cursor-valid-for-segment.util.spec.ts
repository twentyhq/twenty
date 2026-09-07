import { type UpgradeStepKind } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { isUpgradeWorkspaceCursorValidForSegment } from 'src/engine/core-modules/upgrade/utils/is-upgrade-workspace-cursor-valid-for-segment.util';

const SEQUENCE: Array<{ kind: UpgradeStepKind }> = [
  { kind: 'workspace' },
  { kind: 'fast-instance' },
  { kind: 'fast-instance' },
  { kind: 'slow-instance' },
  { kind: 'workspace' },
  { kind: 'workspace' },
];

describe('isUpgradeWorkspaceCursorValidForSegment', () => {
  it('accepts a cursor within the workspace segment', () => {
    expect(
      isUpgradeWorkspaceCursorValidForSegment({
        sequence: SEQUENCE,
        cursorPosition: 5,
        workspaceCursorStatus: 'failed',
        startCursor: 4,
        endCursor: 5,
      }),
    ).toBe(true);
  });

  it('accepts a completed cursor anywhere in the preceding instance segment', () => {
    expect(
      isUpgradeWorkspaceCursorValidForSegment({
        sequence: SEQUENCE,
        cursorPosition: 1,
        workspaceCursorStatus: 'completed',
        startCursor: 4,
        endCursor: 5,
      }),
    ).toBe(true);
  });

  it('rejects a failed cursor in the preceding instance segment', () => {
    expect(
      isUpgradeWorkspaceCursorValidForSegment({
        sequence: SEQUENCE,
        cursorPosition: 1,
        workspaceCursorStatus: 'failed',
        startCursor: 4,
        endCursor: 5,
      }),
    ).toBe(false);
  });

  it('rejects a completed cursor before the preceding instance segment', () => {
    expect(
      isUpgradeWorkspaceCursorValidForSegment({
        sequence: SEQUENCE,
        cursorPosition: 0,
        workspaceCursorStatus: 'completed',
        startCursor: 4,
        endCursor: 5,
      }),
    ).toBe(false);
  });
});
