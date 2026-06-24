import { isDefined } from 'twenty-shared/utils';

import {
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import {
  getWasRemovedInUpgradeClassMetadata,
  getWasRemovedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
  type WasRenamedInUpgradeHistoryEntry,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

export type UpgradeAwareDecoratorReferenceProblem =
  | {
      kind: 'unknown-step-name';
      entityName: string;
      decorator:
        | '@WasIntroducedInUpgrade'
        | '@WasRemovedInUpgrade'
        | '@WasRenamedInUpgrade';
      scope: 'class' | `property:${string}`;
      upgradeCommandName: string;
    }
  | {
      kind: 'rename-history-out-of-order';
      entityName: string;
      scope: 'class' | `property:${string}`;
      offendingUpgradeCommandName: string;
      precedingUpgradeCommandName: string;
    }
  | {
      kind: 'removal-before-introduction';
      entityName: string;
      scope: 'class' | `property:${string}`;
      introductionUpgradeCommandName: string;
      removalUpgradeCommandName: string;
    }
  | {
      kind: 'unknown-property-name';
      entityName: string;
      decorator: '@WasIntroducedInUpgrade';
      propertyName: string;
    };

export const validateUpgradeAwareEntityDecorators = ({
  entityClasses,
  stepNameToIndex,
  columnPropertyNamesByEntityClass,
}: {
  entityClasses: Function[];
  stepNameToIndex: ReadonlyMap<string, number>;
  columnPropertyNamesByEntityClass?: ReadonlyMap<Function, ReadonlySet<string>>;
}): UpgradeAwareDecoratorReferenceProblem[] => {
  const problems: UpgradeAwareDecoratorReferenceProblem[] = [];

  for (const entityClass of entityClasses) {
    const entityName = entityClass.name;
    const columnPropertyNames =
      columnPropertyNamesByEntityClass?.get(entityClass);

    const classIntroduced = getWasIntroducedInUpgradeClassMetadata(entityClass);

    if (
      isDefined(classIntroduced) &&
      !stepNameToIndex.has(classIntroduced.upgradeCommandName)
    ) {
      problems.push({
        kind: 'unknown-step-name',
        entityName,
        decorator: '@WasIntroducedInUpgrade',
        scope: 'class',
        upgradeCommandName: classIntroduced.upgradeCommandName,
      });
    }

    const classRemoved = getWasRemovedInUpgradeClassMetadata(entityClass);

    if (
      isDefined(classRemoved) &&
      !stepNameToIndex.has(classRemoved.upgradeCommandName)
    ) {
      problems.push({
        kind: 'unknown-step-name',
        entityName,
        decorator: '@WasRemovedInUpgrade',
        scope: 'class',
        upgradeCommandName: classRemoved.upgradeCommandName,
      });
    }

    checkRemovalAfterIntroduction({
      entityName,
      scope: 'class',
      introduced: classIntroduced,
      removed: classRemoved,
      stepNameToIndex,
      problems,
    });

    const classRenameHistory =
      getWasRenamedInUpgradeClassMetadata(entityClass) ?? [];

    checkHistoryForReferenceAndOrder({
      entityName,
      scope: 'class',
      history: classRenameHistory,
      stepNameToIndex,
      problems,
    });

    const propIntroducedMap =
      getWasIntroducedInUpgradePropertyMetadata(entityClass);

    for (const [propertyName, options] of Object.entries(propIntroducedMap)) {
      if (!stepNameToIndex.has(options.upgradeCommandName)) {
        problems.push({
          kind: 'unknown-step-name',
          entityName,
          decorator: '@WasIntroducedInUpgrade',
          scope: `property:${propertyName}`,
          upgradeCommandName: options.upgradeCommandName,
        });
      }

      if (
        isDefined(columnPropertyNames) &&
        !columnPropertyNames.has(propertyName)
      ) {
        problems.push({
          kind: 'unknown-property-name',
          entityName,
          decorator: '@WasIntroducedInUpgrade',
          propertyName,
        });
      }
    }

    const propRemovedMap = getWasRemovedInUpgradePropertyMetadata(entityClass);

    for (const [propertyName, options] of Object.entries(propRemovedMap)) {
      if (!stepNameToIndex.has(options.upgradeCommandName)) {
        problems.push({
          kind: 'unknown-step-name',
          entityName,
          decorator: '@WasRemovedInUpgrade',
          scope: `property:${propertyName}`,
          upgradeCommandName: options.upgradeCommandName,
        });
      }

      checkRemovalAfterIntroduction({
        entityName,
        scope: `property:${propertyName}`,
        introduced: propIntroducedMap[propertyName],
        removed: options,
        stepNameToIndex,
        problems,
      });
    }

    const propRenameMap = getWasRenamedInUpgradePropertyMetadata(entityClass);

    for (const [propertyName, history] of Object.entries(propRenameMap)) {
      checkHistoryForReferenceAndOrder({
        entityName,
        scope: `property:${propertyName}`,
        history,
        stepNameToIndex,
        problems,
      });
    }
  }

  return problems;
};

const checkHistoryForReferenceAndOrder = ({
  entityName,
  scope,
  history,
  stepNameToIndex,
  problems,
}: {
  entityName: string;
  scope: 'class' | `property:${string}`;
  history: WasRenamedInUpgradeHistoryEntry[];
  stepNameToIndex: ReadonlyMap<string, number>;
  problems: UpgradeAwareDecoratorReferenceProblem[];
}): void => {
  let previousIndex = -1;
  let previousName: string | undefined;

  for (const entry of history) {
    const index = stepNameToIndex.get(entry.upgradeCommandName);

    if (!isDefined(index)) {
      problems.push({
        kind: 'unknown-step-name',
        entityName,
        decorator: '@WasRenamedInUpgrade',
        scope,
        upgradeCommandName: entry.upgradeCommandName,
      });
      continue;
    }

    if (index <= previousIndex) {
      problems.push({
        kind: 'rename-history-out-of-order',
        entityName,
        scope,
        offendingUpgradeCommandName: entry.upgradeCommandName,
        precedingUpgradeCommandName: previousName ?? '',
      });
    }

    previousIndex = index;
    previousName = entry.upgradeCommandName;
  }
};

const checkRemovalAfterIntroduction = ({
  entityName,
  scope,
  introduced,
  removed,
  stepNameToIndex,
  problems,
}: {
  entityName: string;
  scope: 'class' | `property:${string}`;
  introduced: { upgradeCommandName: string } | undefined;
  removed: { upgradeCommandName: string } | undefined;
  stepNameToIndex: ReadonlyMap<string, number>;
  problems: UpgradeAwareDecoratorReferenceProblem[];
}): void => {
  if (!isDefined(introduced) || !isDefined(removed)) {
    return;
  }

  const introducedIndex = stepNameToIndex.get(introduced.upgradeCommandName);
  const removedIndex = stepNameToIndex.get(removed.upgradeCommandName);

  if (!isDefined(introducedIndex) || !isDefined(removedIndex)) {
    return;
  }

  if (removedIndex <= introducedIndex) {
    problems.push({
      kind: 'removal-before-introduction',
      entityName,
      scope,
      introductionUpgradeCommandName: introduced.upgradeCommandName,
      removalUpgradeCommandName: removed.upgradeCommandName,
    });
  }
};

export const formatUpgradeAwareDecoratorReferenceProblems = (
  problems: UpgradeAwareDecoratorReferenceProblem[],
): string =>
  problems
    .map((problem) => {
      if (problem.kind === 'unknown-step-name') {
        return `  - ${problem.entityName} ${problem.decorator} (${problem.scope}): unknown upgradeCommandName "${problem.upgradeCommandName}"`;
      }

      if (problem.kind === 'rename-history-out-of-order') {
        return `  - ${problem.entityName} @WasRenamedInUpgrade (${problem.scope}): "${problem.offendingUpgradeCommandName}" must come after "${problem.precedingUpgradeCommandName}" in the upgrade sequence`;
      }

      if (problem.kind === 'unknown-property-name') {
        return `  - ${problem.entityName} ${problem.decorator} (property:${problem.propertyName}): "${problem.propertyName}" is not a known property on the entity (check the spelling in the properties array)`;
      }

      return `  - ${problem.entityName} @WasRemovedInUpgrade (${problem.scope}): removal step "${problem.removalUpgradeCommandName}" must come after introduction step "${problem.introductionUpgradeCommandName}" in the upgrade sequence`;
    })
    .join('\n');
