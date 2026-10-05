import { type PullEntity } from '@/app/pull/build-pull-entities';
import { kebabCase } from '@/app/pull/kebab-case';
import { capFileBaseName } from '@/app/pull/pull-file-base-name';
import { isDefined } from 'twenty-shared/utils';

export const resolvePullFileNameCollisions = (
  entities: PullEntity[],
): Map<string, string> => {
  const entitiesByCandidate = new Map<string, PullEntity[]>();

  for (const entity of entities) {
    const candidate = `${entity.defaultFolder}/${entity.fileBaseName}${entity.fileSuffix}`;
    const existing = entitiesByCandidate.get(candidate) ?? [];

    entitiesByCandidate.set(candidate, [...existing, entity]);
  }

  const fileBaseNameByUniversalIdentifier = new Map<string, string>();

  for (const collidingEntities of entitiesByCandidate.values()) {
    if (collidingEntities.length === 1) {
      fileBaseNameByUniversalIdentifier.set(
        collidingEntities[0].universalIdentifier,
        collidingEntities[0].fileBaseName,
      );
      continue;
    }

    const qualifiedNames = collidingEntities.map((entity) =>
      isDefined(entity.parentName)
        ? capFileBaseName(
            `${kebabCase(entity.parentName)}-${entity.fileBaseName}`,
          )
        : entity.fileBaseName,
    );

    collidingEntities.forEach((entity, index) => {
      const qualifiedName = qualifiedNames[index];
      const isQualifiedNameUnique =
        qualifiedNames.indexOf(qualifiedName) ===
        qualifiedNames.lastIndexOf(qualifiedName);

      fileBaseNameByUniversalIdentifier.set(
        entity.universalIdentifier,
        isQualifiedNameUnique
          ? qualifiedName
          : capFileBaseName(
              `${entity.universalIdentifier.slice(0, 8)}-${qualifiedName}`,
            ),
      );
    });
  }

  return fileBaseNameByUniversalIdentifier;
};
