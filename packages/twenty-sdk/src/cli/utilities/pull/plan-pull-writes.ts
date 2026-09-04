import { ManifestEntityKey } from '@/cli/utilities/build/manifest/manifest-extract-config';
import {
  buildPullEntities,
  type PullEntity,
  type PullEntityKind,
} from '@/cli/utilities/pull/build-pull-entities';
import { type ScannedDefineFile } from '@/cli/utilities/pull/scan-project-define-files';
import { writeDefineFile } from '@/cli/utilities/pull/write-define-file';
import { dirname, posix } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export type PullWrite = {
  kind: PullEntityKind;
  universalIdentifier: string;
  relativePath: string;
  content: string;
  isRegeneration: boolean;
};

export type PullDeletion = {
  universalIdentifier: string;
  relativePath: string;
};

export type PullWritePlan = {
  writes: PullWrite[];
  unchanged: PullEntity[];
  deletions: PullDeletion[];
  localOnlyRelativePaths: string[];
};

const ENTITY_KEY_BY_KIND: Record<PullEntityKind, ManifestEntityKey> = {
  application: ManifestEntityKey.Application,
  object: ManifestEntityKey.Objects,
  field: ManifestEntityKey.Fields,
  index: ManifestEntityKey.Indexes,
};

const toPosixPath = (value: string): string => value.split('\\').join('/');

const findExistingFolderForKind = ({
  scannedFiles,
  entityKey,
}: {
  scannedFiles: ScannedDefineFile[];
  entityKey: ManifestEntityKey;
}): string | null => {
  const folderCounts = new Map<string, number>();

  for (const scannedFile of scannedFiles) {
    if (scannedFile.entityKey !== entityKey) {
      continue;
    }

    const folder = toPosixPath(dirname(scannedFile.relativePath));

    folderCounts.set(folder, (folderCounts.get(folder) ?? 0) + 1);
  }

  const sortedFolders = [...folderCounts.entries()].sort(
    ([leftFolder, leftCount], [rightFolder, rightCount]) =>
      rightCount - leftCount || leftFolder.localeCompare(rightFolder),
  );

  return sortedFolders[0]?.[0] ?? null;
};

const resolveFileBaseNames = (entities: PullEntity[]): Map<string, string> => {
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
        ? `${entity.parentName}-${entity.fileBaseName}`
        : entity.fileBaseName,
    );
    const hasUniqueQualifiedNames =
      new Set(qualifiedNames).size === qualifiedNames.length;

    collidingEntities.forEach((entity, index) => {
      fileBaseNameByUniversalIdentifier.set(
        entity.universalIdentifier,
        hasUniqueQualifiedNames
          ? qualifiedNames[index]
          : `${entity.universalIdentifier.slice(0, 8)}-${entity.fileBaseName}`,
      );
    });
  }

  return fileBaseNameByUniversalIdentifier;
};

const buildConfigByUniversalIdentifier = (
  manifest: Manifest | null,
): Map<string, string> => {
  if (!isDefined(manifest)) {
    return new Map();
  }

  return new Map(
    buildPullEntities(manifest).entities.map((entity) => [
      entity.universalIdentifier,
      JSON.stringify(entity.config),
    ]),
  );
};

export const planPullWrites = ({
  manifest,
  baseManifest,
  scannedFiles,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  scannedFiles: ScannedDefineFile[];
}): PullWritePlan & {
  skipped: ReturnType<typeof buildPullEntities>['skipped'];
} => {
  const { entities, skipped } = buildPullEntities(manifest);
  const baseConfigByUniversalIdentifier =
    buildConfigByUniversalIdentifier(baseManifest);
  const fileBaseNameByUniversalIdentifier = resolveFileBaseNames(entities);

  const pathByUniversalIdentifier = new Map<string, string>();
  const applicationFile = scannedFiles.find(
    (scannedFile) => scannedFile.entityKey === ManifestEntityKey.Application,
  );

  for (const scannedFile of scannedFiles) {
    if (isDefined(scannedFile.universalIdentifier)) {
      pathByUniversalIdentifier.set(
        scannedFile.universalIdentifier,
        toPosixPath(scannedFile.relativePath),
      );
    }
  }

  const writes: PullWrite[] = [];
  const unchanged: PullEntity[] = [];
  const usedRelativePaths = new Set<string>();

  for (const entity of entities) {
    const existingPath =
      entity.kind === 'application'
        ? isDefined(applicationFile)
          ? toPosixPath(applicationFile.relativePath)
          : undefined
        : pathByUniversalIdentifier.get(entity.universalIdentifier);

    const folder =
      findExistingFolderForKind({
        scannedFiles,
        entityKey: ENTITY_KEY_BY_KIND[entity.kind],
      }) ?? entity.defaultFolder;
    const fileBaseName =
      fileBaseNameByUniversalIdentifier.get(entity.universalIdentifier) ??
      entity.fileBaseName;
    const relativePath =
      existingPath ?? posix.join(folder, `${fileBaseName}${entity.fileSuffix}`);

    usedRelativePaths.add(relativePath);

    const baseConfig = baseConfigByUniversalIdentifier.get(
      entity.universalIdentifier,
    );

    if (
      isDefined(existingPath) &&
      isDefined(baseConfig) &&
      baseConfig === JSON.stringify(entity.config)
    ) {
      unchanged.push(entity);
      continue;
    }

    writes.push({
      kind: entity.kind,
      universalIdentifier: entity.universalIdentifier,
      relativePath,
      content: writeDefineFile({
        definer: entity.definer,
        config: entity.config,
        enumBindings: entity.enumBindings,
      }),
      isRegeneration: isDefined(existingPath),
    });
  }

  const exportedUniversalIdentifiers = new Set(
    entities.map((entity) => entity.universalIdentifier),
  );
  const deletions: PullDeletion[] = [];

  for (const baseUniversalIdentifier of baseConfigByUniversalIdentifier.keys()) {
    if (exportedUniversalIdentifiers.has(baseUniversalIdentifier)) {
      continue;
    }

    const relativePath = pathByUniversalIdentifier.get(baseUniversalIdentifier);

    if (!isDefined(relativePath) || usedRelativePaths.has(relativePath)) {
      continue;
    }

    deletions.push({
      universalIdentifier: baseUniversalIdentifier,
      relativePath,
    });
  }

  const localOnlyRelativePaths = scannedFiles
    .filter(
      (scannedFile) =>
        isDefined(scannedFile.universalIdentifier) &&
        !exportedUniversalIdentifiers.has(scannedFile.universalIdentifier) &&
        !baseConfigByUniversalIdentifier.has(scannedFile.universalIdentifier) &&
        !usedRelativePaths.has(toPosixPath(scannedFile.relativePath)),
    )
    .map((scannedFile) => toPosixPath(scannedFile.relativePath));

  return {
    writes,
    unchanged,
    deletions,
    localOnlyRelativePaths,
    skipped,
  };
};
