import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildPullBaseEntities } from '@/cli/utilities/pull/build-pull-base-entities';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import { planTranslationWrites } from '@/cli/utilities/pull/plan-translation-writes';
import { writeDefineFile } from '@/cli/utilities/pull/write-define-file';

export const getOverwrittenLocalChanges = async ({
  appPath,
  baseManifest,
  writes,
  deletions,
  frontComponentSourcePaths,
  unreconciledUniversalIdentifiers,
}: {
  appPath: string;
  baseManifest: Manifest | null;
  writes: PullWrite[];
  deletions: PullDeletion[];
  frontComponentSourcePaths: string[];
  unreconciledUniversalIdentifiers?: ReadonlySet<string>;
}): Promise<PullDeletion[]> => {
  if (!isDefined(baseManifest)) {
    return [];
  }

  const baseContents = new Map(
    buildPullBaseEntities({
      manifest: baseManifest,
      unreconciledUniversalIdentifiers,
    }).map((entity) => [
      entity.universalIdentifier,
      writeDefineFile({
        definer: entity.definer,
        config: entity.config,
        enumBindings: entity.enumBindings,
      }),
    ]),
  );
  const translationPlan = await planTranslationWrites({
    appPath,
    manifest: baseManifest,
    baseManifest: null,
    frontComponentSourcePaths,
  });
  const translationContents = new Map(
    translationPlan.writes.map((write) => [write.relativePath, write.content]),
  );
  const overwrittenLocalChanges: PullDeletion[] = [];

  for (const { universalIdentifier, relativePath } of [
    ...writes.filter((write) => write.isRegeneration),
    ...deletions,
  ]) {
    const baseContent =
      baseContents.get(universalIdentifier) ??
      translationContents.get(relativePath);

    if (
      isDefined(baseContent) &&
      (await readFile(join(appPath, relativePath), 'utf8')) !== baseContent
    ) {
      overwrittenLocalChanges.push({ universalIdentifier, relativePath });
    }
  }

  return overwrittenLocalChanges;
};
