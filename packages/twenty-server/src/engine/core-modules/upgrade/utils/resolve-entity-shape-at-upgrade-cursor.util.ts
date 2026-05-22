import { isDefined } from 'twenty-shared/utils';

import {
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { resolveEffectiveNameFromRenameHistory } from 'src/engine/core-modules/upgrade/utils/resolve-effective-name-from-rename-history.util';

export type ResolvedEntityShapeAtUpgradeCursor = {
  isAvailable: boolean;
  effectiveTableName: string;
  hiddenPropertyNames: ReadonlySet<string>;
  columnDatabaseNameRemap: ReadonlyMap<string, string>;
};

export const resolveEntityShapeAtUpgradeCursor = ({
  entityClass,
  currentTableName,
  currentColumns,
  isStepApplied,
}: {
  entityClass: Function;
  currentTableName: string;
  currentColumns: { propertyName: string; databaseName: string }[];
  isStepApplied: (stepName: string) => boolean;
}): ResolvedEntityShapeAtUpgradeCursor => {
  const classIntroduced = getWasIntroducedInUpgradeClassMetadata(entityClass);
  const isAvailable =
    !isDefined(classIntroduced) ||
    isStepApplied(classIntroduced.upgradeCommandName);

  const classRenameHistory =
    getWasRenamedInUpgradeClassMetadata(entityClass) ?? [];
  const effectiveTableName = resolveEffectiveNameFromRenameHistory({
    currentName: currentTableName,
    history: classRenameHistory,
    isStepApplied,
  });

  const propertyIntroductionMap =
    getWasIntroducedInUpgradePropertyMetadata(entityClass);
  const propertyRemovalMap =
    getWasRemovedInUpgradePropertyMetadata(entityClass);
  const propertyRenameMap = getWasRenamedInUpgradePropertyMetadata(entityClass);

  const hiddenPropertyNames = new Set<string>();
  const columnDatabaseNameRemap = new Map<string, string>();

  for (const column of currentColumns) {
    const introduced = propertyIntroductionMap[column.propertyName];

    if (
      isDefined(introduced) &&
      !isStepApplied(introduced.upgradeCommandName)
    ) {
      hiddenPropertyNames.add(column.propertyName);
      continue;
    }

    const removed = propertyRemovalMap[column.propertyName];

    if (isDefined(removed) && isStepApplied(removed.upgradeCommandName)) {
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
      isStepApplied,
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
