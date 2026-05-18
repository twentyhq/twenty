import { type UpgradePosition } from 'src/engine/core-modules/upgrade/types/upgrade-position.type';

export const isCommandAppliedInUpgradePosition = (
  position: UpgradePosition,
  upgradeCommandName: string,
): boolean => position.appliedCommandNames.has(upgradeCommandName);
