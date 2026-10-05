import { type ManifestEntityKey } from '@/app/source/extract-define-entity';
import { buildPullBaseEntities } from '@/app/pull/build-pull-base-entities';
import {
  buildPullEntities,
  type PullEntity,
  type PullEntityKind,
} from '@/app/pull/build-pull-entities';
import { resolvePullFileNameCollisions } from '@/app/pull/resolve-pull-file-name-collisions';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';
import { writeDefineFile } from '@/app/pull/write-define-file';
import { dirname, posix } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export type PullWriteKind = PullEntityKind | 'translation';

export type PullWrite = {
  kind: PullWriteKind;
  universalIdentifier: string;
  relativePath: string;
  content: string;
  requiredSdkExports: string[];
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

const toReservationKey = (relativePath: string): string =>
  relativePath.toLowerCase();

const ENTITY_KEY_BY_KIND: Record<PullEntityKind, ManifestEntityKey> = {
  application: 'application',
  object: 'objects',
  field: 'fields',
  index: 'indexes',
  permissionFlag: 'permissionFlags',
  role: 'roles',
  view: 'views',
  viewField: 'viewFields',
  pageLayout: 'pageLayouts',
  pageLayoutTab: 'pageLayoutTabs',
  navigationMenuItem: 'navigationMenuItems',
  pageLayoutWidget: 'pageLayoutWidgets',
};

const toPosixPath = (value: string): string => value.split('\\').join('/');

const findExistingFolderForKind = ({
  scannedFiles,
  entityKey,
}: {
  scannedFiles: ScannedSourceFile[];
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

const reserveRelativePath = ({
  folder,
  fileBaseName,
  fileSuffix,
  universalIdentifier,
  takenRelativePaths,
}: {
  folder: string;
  fileBaseName: string;
  fileSuffix: string;
  universalIdentifier: string;
  takenRelativePaths: Set<string>;
}): string => {
  const identifierPrefix = universalIdentifier.slice(0, 8);
  const candidates = [
    fileBaseName,
    `${identifierPrefix}-${fileBaseName}`,
    ...Array.from(
      { length: 100 },
      (_unused, index) => `${identifierPrefix}-${fileBaseName}-${index + 2}`,
    ),
  ];

  for (const candidate of candidates) {
    const candidatePath = posix.join(folder, `${candidate}${fileSuffix}`);

    if (!takenRelativePaths.has(toReservationKey(candidatePath))) {
      return candidatePath;
    }
  }

  throw new Error(
    `Could not find a free file name for ${universalIdentifier} in ${folder}`,
  );
};

const findExistingSourceFile = ({
  entity,
  applicationFile,
  scannedFileByUniversalIdentifier,
}: {
  entity: PullEntity;
  applicationFile: ScannedSourceFile | undefined;
  scannedFileByUniversalIdentifier: Map<string, ScannedSourceFile>;
}): ScannedSourceFile | undefined =>
  entity.kind === 'application'
    ? applicationFile
    : scannedFileByUniversalIdentifier.get(entity.universalIdentifier);

export const planPullWrites = ({
  manifest,
  baseManifest,
  scannedFiles,
  workspaceUniversalIdentifiers,
  unreconciledUniversalIdentifiers,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  scannedFiles: ScannedSourceFile[];
  workspaceUniversalIdentifiers: ReadonlySet<string>;
  unreconciledUniversalIdentifiers?: ReadonlySet<string>;
}): PullWritePlan & {
  skipped: ReturnType<typeof buildPullEntities>['skipped'];
} => {
  const { entities, skipped } = buildPullEntities(manifest);
  const baseConfigByUniversalIdentifier = new Map(
    buildPullBaseEntities({
      manifest: baseManifest,
      unreconciledUniversalIdentifiers,
    }).map((entity) => [
      entity.universalIdentifier,
      JSON.stringify(entity.config),
    ]),
  );
  const fileBaseNameByUniversalIdentifier =
    resolvePullFileNameCollisions(entities);

  const scannedFileByUniversalIdentifier = new Map<string, ScannedSourceFile>();
  const applicationFile = scannedFiles.find(
    (scannedFile) => scannedFile.entityKey === 'application',
  );

  for (const scannedFile of scannedFiles) {
    if (isDefined(scannedFile.universalIdentifier)) {
      scannedFileByUniversalIdentifier.set(
        scannedFile.universalIdentifier,
        scannedFile,
      );
    }
  }

  const writes: PullWrite[] = [];
  const unchanged: PullEntity[] = [];
  const usedRelativePaths = new Set<string>();
  const takenRelativePaths = new Set(
    scannedFiles.map((scannedFile) =>
      toReservationKey(toPosixPath(scannedFile.relativePath)),
    ),
  );

  for (const entity of entities) {
    const existingSourceFile = findExistingSourceFile({
      entity,
      applicationFile,
      scannedFileByUniversalIdentifier,
    });
    const existingPath = isDefined(existingSourceFile)
      ? toPosixPath(existingSourceFile.relativePath)
      : undefined;

    const folder =
      findExistingFolderForKind({
        scannedFiles,
        entityKey: ENTITY_KEY_BY_KIND[entity.kind],
      }) ?? entity.defaultFolder;
    const fileBaseName =
      fileBaseNameByUniversalIdentifier.get(entity.universalIdentifier) ??
      entity.fileBaseName;
    const relativePath =
      existingPath ??
      reserveRelativePath({
        folder,
        fileBaseName,
        fileSuffix: entity.fileSuffix,
        universalIdentifier: entity.universalIdentifier,
        takenRelativePaths,
      });

    usedRelativePaths.add(relativePath);
    takenRelativePaths.add(toReservationKey(relativePath));

    const baseConfig = baseConfigByUniversalIdentifier.get(
      entity.universalIdentifier,
    );

    if (
      isDefined(existingSourceFile) &&
      existingSourceFile.targetFunctionName === entity.definer &&
      !unreconciledUniversalIdentifiers?.has(
        entity.universalIdentifier.toLowerCase(),
      ) &&
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
      ...writeDefineFile({
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

    const scannedFile = scannedFileByUniversalIdentifier.get(
      baseUniversalIdentifier,
    );
    const relativePath = isDefined(scannedFile)
      ? toPosixPath(scannedFile.relativePath)
      : undefined;

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
        !workspaceUniversalIdentifiers.has(scannedFile.universalIdentifier) &&
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
