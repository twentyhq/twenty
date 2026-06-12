import { type WasRenamedInUpgradeHistoryEntry } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

export const resolveEffectiveNameFromRenameHistory = ({
  currentName,
  history,
  isStepApplied,
}: {
  currentName: string;
  history: WasRenamedInUpgradeHistoryEntry[];
  isStepApplied: (stepName: string) => boolean;
}): string => {
  for (const entry of history) {
    if (!isStepApplied(entry.upgradeCommandName)) {
      return entry.previousName;
    }
  }

  return currentName;
};
