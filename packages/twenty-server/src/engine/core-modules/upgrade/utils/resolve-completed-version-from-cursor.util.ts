import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { extractVersionFromCommandName } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name.util';
import { isDefined } from 'twenty-shared/utils';

// A version counts as completed only when the cursor sits on its last step in
// the sequence and that step succeeded. Anywhere else in the segment, the
// highest completed version is the one preceding the cursor's own version.
export const resolveCompletedVersionFromCursor = ({
  sequenceStepNames,
  cursorName,
  cursorStatus,
}: {
  sequenceStepNames: string[];
  cursorName: string;
  cursorStatus: UpgradeMigrationStatus;
}): string | null => {
  const cursorIndex = sequenceStepNames.indexOf(cursorName);

  if (cursorIndex === -1) {
    return null;
  }

  const cursorVersion = extractVersionFromCommandName(cursorName);

  if (!isDefined(cursorVersion)) {
    return null;
  }

  const isLastStepOfItsVersion =
    cursorIndex === sequenceStepNames.length - 1 ||
    extractVersionFromCommandName(sequenceStepNames[cursorIndex + 1]) !==
      cursorVersion;

  if (cursorStatus === 'completed' && isLastStepOfItsVersion) {
    return cursorVersion;
  }

  for (let stepIndex = cursorIndex - 1; stepIndex >= 0; stepIndex--) {
    const stepVersion = extractVersionFromCommandName(
      sequenceStepNames[stepIndex],
    );

    if (stepVersion !== cursorVersion) {
      return stepVersion;
    }
  }

  return null;
};
