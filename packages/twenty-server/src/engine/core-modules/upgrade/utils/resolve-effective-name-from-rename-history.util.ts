import { type WasRenamedInUpgradeHistoryEntry } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { type UpgradePosition } from 'src/engine/core-modules/upgrade/types/upgrade-position.type';
import { isCommandAppliedInUpgradePosition } from 'src/engine/core-modules/upgrade/utils/is-command-applied-in-upgrade-position.util';

// Walks rename history chronologically (oldest entry first). For each entry,
// if its upgradeCommandName has NOT yet been applied at this position, the
// effective name is that entry's previousName. Otherwise we advance past it.
// If every entry is applied, the current (final) name is in effect.

export const resolveEffectiveNameFromRenameHistory = ({
  currentName,
  history,
  position,
}: {
  currentName: string;
  history: WasRenamedInUpgradeHistoryEntry[];
  position: UpgradePosition;
}): string => {
  for (const entry of history) {
    if (
      !isCommandAppliedInUpgradePosition(position, entry.upgradeCommandName)
    ) {
      return entry.previousName;
    }
  }

  return currentName;
};
