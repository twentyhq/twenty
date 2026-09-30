import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { collectIdentifiers } from '@/application-build/pull/collect-identifiers';
import {
  buildPullEntities,
  type SkippedPullEntity,
} from '@/cli/utilities/pull/build-pull-entities';
import { type PullWrite } from '@/cli/utilities/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/cli/utilities/pull/scan-project-source-files';

export const preserveNestedPullEntities = ({
  manifest,
  baseManifest,
  coverageIdentifiers,
  writes,
  scannedFiles,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  coverageIdentifiers: ReadonlySet<string>;
  writes: PullWrite[];
  scannedFiles: ScannedSourceFile[];
}): { writes: PullWrite[]; skipped: SkippedPullEntity[] } => {
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
  const safeWrites = writes.filter((write) => {
    if (write.kind === 'translation' || !write.isRegeneration) {
      return true;
    }

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
  });

  return { writes: safeWrites, skipped };
};
