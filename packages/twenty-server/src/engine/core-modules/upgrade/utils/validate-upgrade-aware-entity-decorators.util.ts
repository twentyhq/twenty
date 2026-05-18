import { isDefined } from 'twenty-shared/utils';

import {
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
  type WasRenamedInUpgradeHistoryEntry,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

export type UpgradeAwareDecoratorReferenceProblem =
  | {
      kind: 'unknown-step-name';
      entityName: string;
      decorator: '@WasIntroducedInUpgrade' | '@WasRenamedInUpgrade';
      scope: 'class' | `property:${string}`;
      upgradeCommandName: string;
    }
  | {
      kind: 'rename-history-out-of-order';
      entityName: string;
      scope: 'class' | `property:${string}`;
      offendingUpgradeCommandName: string;
      precedingUpgradeCommandName: string;
    };

export const validateUpgradeAwareEntityDecorators = ({
  entityClasses,
  stepNameToIndex,
}: {
  entityClasses: Function[];
  stepNameToIndex: ReadonlyMap<string, number>;
}): UpgradeAwareDecoratorReferenceProblem[] => {
  const problems: UpgradeAwareDecoratorReferenceProblem[] = [];

  for (const entityClass of entityClasses) {
    const entityName = entityClass.name;

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

export const formatUpgradeAwareDecoratorReferenceProblems = (
  problems: UpgradeAwareDecoratorReferenceProblem[],
): string =>
  problems
    .map((problem) => {
      if (problem.kind === 'unknown-step-name') {
        return `  - ${problem.entityName} ${problem.decorator} (${problem.scope}): unknown upgradeCommandName "${problem.upgradeCommandName}"`;
      }

      return `  - ${problem.entityName} @WasRenamedInUpgrade (${problem.scope}): "${problem.offendingUpgradeCommandName}" must come after "${problem.precedingUpgradeCommandName}" in the upgrade sequence`;
    })
    .join('\n');
