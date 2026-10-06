import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { collectIdentifiers } from '@/app/pull/collect-identifiers';
import {
  buildPullEntities,
  type SkippedPullEntity,
} from '@/app/pull/build-pull-entities';
import { type PullWrite, type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

export const preserveNestedPullEntities = ({
  manifest,
  baseManifest,
  coverageIdentifiers,
  writes,
  deletions,
  scannedFiles,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  coverageIdentifiers: ReadonlySet<string>;
  writes: PullWrite[];
  deletions: PullDeletion[];
  scannedFiles: ScannedSourceFile[];
}): {
  writes: PullWrite[];
  deletions: PullDeletion[];
  skipped: SkippedPullEntity[];
} => {
  const baseIdentifiers = new Set<string>();

  collectIdentifiers({ value: baseManifest, identifiers: baseIdentifiers });

  const localConfigByPath = new Map(
    scannedFiles.map((file) => [
      file.relativePath.split('\\').join('/'),
      file.config,
    ]),
  );
  const exportedConfigByIdentifier = new Map(
    buildPullEntities(manifest).entities.map((entity) => [
      entity.universalIdentifier.toLowerCase(),
      entity.config,
    ]),
  );
  const skipped: SkippedPullEntity[] = [];
  const isSafeChange = (
    write: PullDeletion & { kind: SkippedPullEntity['kind'] },
  ): boolean => {
    const localIdentifiers = new Set<string>();
    const exportedIdentifiers = new Set<string>();

    collectIdentifiers({
      value: localConfigByPath.get(write.relativePath),
      identifiers: localIdentifiers,
    });
    collectIdentifiers({
      value: exportedConfigByIdentifier.get(
        write.universalIdentifier.toLowerCase(),
      ),
      identifiers: exportedIdentifiers,
    });

    const omittedIdentifier = [...localIdentifiers].find(
      (identifier) =>
        !exportedIdentifiers.has(identifier) &&
        (coverageIdentifiers.has(identifier) ||
          !baseIdentifiers.has(identifier)),
    );

    if (!isDefined(omittedIdentifier)) {
      return true;
    }

    skipped.push({
      kind: write.kind,
      universalIdentifier: write.universalIdentifier,
      reason: `preserving ${write.relativePath}, replacement would remove nested local definition ${omittedIdentifier} without a confirmed remote deletion`,
    });

    return false;
  };
  const safeWrites = writes.filter(
    (write) =>
      write.kind === 'translation' ||
      !write.isRegeneration ||
      isSafeChange({ ...write, kind: write.kind }),
  );
  const baseEntityByIdentifier = new Map(
    (isDefined(baseManifest)
      ? buildPullEntities(baseManifest).entities
      : []
    ).map((entity) => [entity.universalIdentifier.toLowerCase(), entity]),
  );
  const safeDeletions = deletions.filter((deletion) => {
    const entity = baseEntityByIdentifier.get(
      deletion.universalIdentifier.toLowerCase(),
    );

    return (
      !isDefined(entity) || isSafeChange({ ...deletion, kind: entity.kind })
    );
  });

  return { writes: safeWrites, deletions: safeDeletions, skipped };
};
