import {
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

export type UpgradeAwareDecoratorReferenceProblem = {
  entityName: string;
  decorator:
    | '@WasIntroducedInUpgrade'
    | '@WasRenamedInUpgrade';
  scope: 'class' | `property:${string}`;
  upgradeCommandName: string;
};

export const validateUpgradeAwareEntityDecorators = ({
  entityClasses,
  knownStepNames,
}: {
  entityClasses: Function[];
  knownStepNames: ReadonlySet<string>;
}): UpgradeAwareDecoratorReferenceProblem[] => {
  const problems: UpgradeAwareDecoratorReferenceProblem[] = [];

  for (const entityClass of entityClasses) {
    const entityName = entityClass.name;

    const classIntroduced = getWasIntroducedInUpgradeClassMetadata(entityClass);

    if (
      classIntroduced &&
      !knownStepNames.has(classIntroduced.upgradeCommandName)
    ) {
      problems.push({
        entityName,
        decorator: '@WasIntroducedInUpgrade',
        scope: 'class',
        upgradeCommandName: classIntroduced.upgradeCommandName,
      });
    }

    const classRenameHistory =
      getWasRenamedInUpgradeClassMetadata(entityClass) ?? [];

    for (const entry of classRenameHistory) {
      if (!knownStepNames.has(entry.upgradeCommandName)) {
        problems.push({
          entityName,
          decorator: '@WasRenamedInUpgrade',
          scope: 'class',
          upgradeCommandName: entry.upgradeCommandName,
        });
      }
    }

    const propIntroducedMap =
      getWasIntroducedInUpgradePropertyMetadata(entityClass);

    for (const [propertyName, options] of Object.entries(propIntroducedMap)) {
      if (!knownStepNames.has(options.upgradeCommandName)) {
        problems.push({
          entityName,
          decorator: '@WasIntroducedInUpgrade',
          scope: `property:${propertyName}`,
          upgradeCommandName: options.upgradeCommandName,
        });
      }
    }

    const propRenameMap = getWasRenamedInUpgradePropertyMetadata(entityClass);

    for (const [propertyName, history] of Object.entries(propRenameMap)) {
      for (const entry of history) {
        if (!knownStepNames.has(entry.upgradeCommandName)) {
          problems.push({
            entityName,
            decorator: '@WasRenamedInUpgrade',
            scope: `property:${propertyName}`,
            upgradeCommandName: entry.upgradeCommandName,
          });
        }
      }
    }
  }

  return problems;
};

export const formatUpgradeAwareDecoratorReferenceProblems = (
  problems: UpgradeAwareDecoratorReferenceProblem[],
): string =>
  problems
    .map(
      ({ entityName, decorator, scope, upgradeCommandName }) =>
        `  - ${entityName} ${decorator} (${scope}): unknown upgradeCommandName "${upgradeCommandName}"`,
    )
    .join('\n');
