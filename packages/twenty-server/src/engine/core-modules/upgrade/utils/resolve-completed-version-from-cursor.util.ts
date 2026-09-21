import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { extractVersionFromCommandNameOrThrow } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name-or-throw.util';

export type UpgradeCursor = {
  name: string;
  status: UpgradeMigrationStatus;
};

export const resolveCompletedVersionFromCursor = ({
  stepNames,
  cursor,
}: {
  stepNames: string[];
  cursor: UpgradeCursor;
}): string | null => {
  const cursorIndex = stepNames.indexOf(cursor.name);

  if (cursorIndex === -1) {
    return null;
  }

  const cursorVersion = extractVersionFromCommandNameOrThrow(cursor.name);

  const nextStepName =
    cursorIndex < stepNames.length - 1 ? stepNames[cursorIndex + 1] : null;

  const isCursorOnLastStepOfItsVersion =
    nextStepName === null ||
    extractVersionFromCommandNameOrThrow(nextStepName) !== cursorVersion;

  if (cursor.status === 'completed' && isCursorOnLastStepOfItsVersion) {
    return cursorVersion;
  }

  for (let stepIndex = cursorIndex - 1; stepIndex >= 0; stepIndex--) {
    const stepVersion = extractVersionFromCommandNameOrThrow(
      stepNames[stepIndex],
    );

    if (stepVersion !== cursorVersion) {
      return stepVersion;
    }
  }

  return null;
};
