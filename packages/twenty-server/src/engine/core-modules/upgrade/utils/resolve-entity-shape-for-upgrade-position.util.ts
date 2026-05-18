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
  // false when the class carries @WasIntroducedInUpgrade for a command that
  // has not yet been applied. The metadata mutator marks such entities as
  // unavailable so repository reads short-circuit to empty results.
  isAvailable: boolean;

  // The table name that should be used at this position. For entities with
  // no @WasRenamedInUpgrade history, this equals currentTableName.
  effectiveTableName: string;

  // Properties carrying @WasIntroducedInUpgrade for a not-yet-applied command.
  // Selects must strip these (the column doesn't exist in the DB yet) and
  // writes touching them must throw.
  hiddenPropertyNames: ReadonlySet<string>;

  // Property → effective database column name, for columns whose
  // @WasRenamedInUpgrade history hasn't fully caught up to the current name.
  // Only contains entries that differ from the current database name.
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
