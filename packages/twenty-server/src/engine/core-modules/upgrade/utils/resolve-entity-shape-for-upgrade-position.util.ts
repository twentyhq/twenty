import { isDefined } from 'twenty-shared/utils';

import {
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { type UpgradePosition } from 'src/engine/core-modules/upgrade/types/upgrade-position.type';
import { isCommandAppliedInUpgradePosition } from 'src/engine/core-modules/upgrade/utils/is-command-applied-in-upgrade-position.util';
import { resolveEffectiveNameFromRenameHistory } from 'src/engine/core-modules/upgrade/utils/resolve-effective-name-from-rename-history.util';

export type ResolvedEntityShapeForUpgradePosition = {
  isAvailable: boolean;
  effectiveTableName: string;
  hiddenPropertyNames: ReadonlySet<string>;
  columnDatabaseNameRemap: ReadonlyMap<string, string>;
};

export const resolveEntityShapeForUpgradePosition = ({
  entityClass,
  currentTableName,
  currentColumns,
  position,
}: {
  entityClass: Function;
  currentTableName: string;
  currentColumns: { propertyName: string; databaseName: string }[];
  position: UpgradePosition;
}): ResolvedEntityShapeForUpgradePosition => {
  const classIntroduced = getWasIntroducedInUpgradeClassMetadata(entityClass);
  const isAvailable =
    !isDefined(classIntroduced) ||
    isCommandAppliedInUpgradePosition(
      position,
      classIntroduced.upgradeCommandName,
    );

  const classRenameHistory =
    getWasRenamedInUpgradeClassMetadata(entityClass) ?? [];
  const effectiveTableName = resolveEffectiveNameFromRenameHistory({
    currentName: currentTableName,
    history: classRenameHistory,
    position,
  });

  const propertyIntroductionMap =
    getWasIntroducedInUpgradePropertyMetadata(entityClass);
  const propertyRenameMap =
    getWasRenamedInUpgradePropertyMetadata(entityClass);

  const hiddenPropertyNames = new Set<string>();
  const columnDatabaseNameRemap = new Map<string, string>();

  for (const column of currentColumns) {
    const introduced = propertyIntroductionMap[column.propertyName];

    if (
      isDefined(introduced) &&
      !isCommandAppliedInUpgradePosition(
        position,
        introduced.upgradeCommandName,
      )
    ) {
      hiddenPropertyNames.add(column.propertyName);
      continue;
    }

    const renameHistory = propertyRenameMap[column.propertyName] ?? [];

    if (renameHistory.length === 0) {
      continue;
    }

    const effectiveColumnName = resolveEffectiveNameFromRenameHistory({
      currentName: column.databaseName,
      history: renameHistory,
      position,
    });

    if (effectiveColumnName !== column.databaseName) {
      columnDatabaseNameRemap.set(column.propertyName, effectiveColumnName);
    }
  }

  return {
    isAvailable,
    effectiveTableName,
    hiddenPropertyNames,
    columnDatabaseNameRemap,
  };
};
