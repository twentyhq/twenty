import { type WasRenamedInUpgradeHistoryEntry } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { type UpgradePosition } from 'src/engine/core-modules/upgrade/types/upgrade-position.type';
import { isCommandAppliedInUpgradePosition } from 'src/engine/core-modules/upgrade/utils/is-command-applied-in-upgrade-position.util';

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
