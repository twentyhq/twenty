import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildPullBaseEntities } from '@/app/pull/build-pull-base-entities';
import { buildPullEntities } from '@/app/pull/build-pull-entities';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

export const preparePullEntities = ({
  manifest,
  baseManifest,
  scannedFiles,
  unreconciledUniversalIdentifiers,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  scannedFiles: ScannedSourceFile[];
  unreconciledUniversalIdentifiers?: ReadonlySet<string>;
}) => {
  const sourceFileByUniversalIdentifier = new Map<string, ScannedSourceFile>();

  for (const file of scannedFiles) {
    if (file.isReadable && isDefined(file.universalIdentifier)) {
      sourceFileByUniversalIdentifier.set(
        file.universalIdentifier.toLowerCase(),
        file,
      );
    }
  }

  const { entities, skipped } = buildPullEntities(
    manifest,
    sourceFileByUniversalIdentifier,
  );
  const baseEntities = buildPullBaseEntities({
    entities: isDefined(baseManifest)
      ? buildPullEntities(baseManifest, sourceFileByUniversalIdentifier)
          .entities
      : [],
    unreconciledUniversalIdentifiers,
  });

  return { entities, baseEntities, skipped };
};
