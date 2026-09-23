import { type UpgradeStepKind } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';

export const isUpgradeWorkspaceCursorValidForSegment = ({
  sequence,
  cursorPosition,
  workspaceCursorStatus,
  startCursor,
  endCursor,
}: {
  sequence: Array<{ kind: UpgradeStepKind }>;
  cursorPosition: number;
  workspaceCursorStatus: UpgradeMigrationStatus;
  startCursor: number;
  endCursor: number;
}): boolean => {
  if (cursorPosition >= startCursor && cursorPosition <= endCursor) {
    return true;
  }

  if (workspaceCursorStatus !== 'completed') {
    return false;
  }

  let precedingInstanceSegmentStartCursor = startCursor;

  while (
    precedingInstanceSegmentStartCursor > 0 &&
    sequence[precedingInstanceSegmentStartCursor - 1]?.kind !== 'workspace'
  ) {
    precedingInstanceSegmentStartCursor--;
  }

  // A workspace provisioned later has no cursor for instance commands that were already globally complete.
  return (
    cursorPosition >= precedingInstanceSegmentStartCursor &&
    cursorPosition < startCursor
  );
};
