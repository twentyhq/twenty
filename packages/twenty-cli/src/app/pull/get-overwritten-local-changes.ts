import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type PullEntity } from '@/app/pull/build-pull-entities';
import { extractWorkflowCodeStepFiles } from '@/app/pull/extract-workflow-code-step-files';
import { hashContent } from '@/utils/hash-content';
import { type PullDeletion, type PullWrite } from '@/app/pull/plan-pull-writes';
import { planTranslationWrites } from '@/app/pull/plan-translation-writes';
import { writeDefineFile } from '@/app/pull/write-define-file';
import { writePullEntityFile } from '@/app/pull/write-pull-entity-file';

export const getOverwrittenLocalChanges = async ({
  appPath,
  baseManifest,
  writes,
  deletions,
  frontComponentSourcePaths,
  sourceFingerprints,
  baseEntities,
  localCodeStepFilesByWorkflowPath,
}: {
  appPath: string;
  baseManifest: Manifest | null;
  writes: PullWrite[];
  deletions: PullDeletion[];
  frontComponentSourcePaths: string[];
  sourceFingerprints?: Record<string, string>;
  baseEntities: PullEntity[];
  localCodeStepFilesByWorkflowPath: ReadonlyMap<string, PullDeletion[]>;
}): Promise<PullDeletion[]> => {
  if (!isDefined(baseManifest)) {
    return [];
  }

  const baseEntityByUniversalIdentifier = new Map(
    baseEntities.map((entity) => [entity.universalIdentifier, entity]),
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
  const baselineAbsentTranslationPaths = new Set(
    translationPlan.deletions.map(({ relativePath }) => relativePath),
  );
  const baseCodeByStepIdentifier = new Map(
    baseEntities.flatMap((entity) =>
      entity.kind === 'workflow'
        ? extractWorkflowCodeStepFiles({
            config: entity.config,
            workflowRelativePath: '',
          }).codeStepFiles.map(
            ({ universalIdentifier, content }) =>
              [universalIdentifier.toLowerCase(), content] as const,
          )
        : [],
    ),
  );
  const localCodeStepFiles = [
    ...localCodeStepFilesByWorkflowPath.values(),
  ].flat();
  const localCodeStepPathByStepIdentifier = new Map(
    localCodeStepFiles.map(({ universalIdentifier, relativePath }) => [
      universalIdentifier.toLowerCase(),
      relativePath,
    ]),
  );
  // Code step files are keyed by step, while base entities are keyed by workflow
  const baseCodeStepContentByRelativePath = new Map(
    localCodeStepFiles.flatMap(({ universalIdentifier, relativePath }) => {
      const baseCode = baseCodeByStepIdentifier.get(
        universalIdentifier.toLowerCase(),
      );

      return isDefined(baseCode) ? [[relativePath, baseCode] as const] : [];
    }),
  );
  const getBaseContents = ({
    universalIdentifier,
    relativePath,
  }: PullDeletion): string[] => {
    const baseEntity = baseEntityByUniversalIdentifier.get(universalIdentifier);

    if (isDefined(baseEntity)) {
      // A file pulled before code steps had their own files holds their source inline
      return [
        writePullEntityFile({
          entity: baseEntity,
          relativePath,
          localCodeStepPathByStepIdentifier,
        }).content,
        writeDefineFile({
          definer: baseEntity.definer,
          config: baseEntity.config,
          enumBindings: baseEntity.enumBindings,
        }).content,
      ];
    }

    const baseContent =
      baseCodeStepContentByRelativePath.get(relativePath) ??
      translationContents.get(relativePath);

    return isDefined(baseContent) ? [baseContent] : [];
  };
  const overwrittenLocalChanges: PullDeletion[] = [];

  for (const { universalIdentifier, relativePath } of [
    ...writes.filter((write) => write.isRegeneration),
    ...deletions,
  ]) {
    const sourceFingerprint = sourceFingerprints?.[relativePath];

    if (isDefined(sourceFingerprint)) {
      if (
        hashContent(await readFile(join(appPath, relativePath))) !==
        sourceFingerprint
      ) {
        overwrittenLocalChanges.push({ universalIdentifier, relativePath });
      }

      continue;
    }

    const baseContents = getBaseContents({ universalIdentifier, relativePath });

    if (
      baselineAbsentTranslationPaths.has(relativePath) ||
      (baseContents.length > 0 &&
        !baseContents.includes(
          await readFile(join(appPath, relativePath), 'utf8'),
        ))
    ) {
      overwrittenLocalChanges.push({ universalIdentifier, relativePath });
    }
  }

  return overwrittenLocalChanges;
};
