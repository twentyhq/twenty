import { join } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { assertPullPaths } from '@/application-build/pull/assert-pull-paths';
import { collectIdentifiers } from '@/application-build/pull/collect-identifiers';
import { getOverwrittenLocalChanges } from '@/application-build/pull/get-overwritten-local-changes';
import { prepareAppPull } from '@/application-build/pull/prepare-app-pull';
import { preserveNestedPullEntities } from '@/application-build/pull/preserve-nested-pull-entities';
import {
  createPullBaseWrite,
  readTargetBoundPullBase,
} from '@/application-build/pull/target-bound-pull-base';
import {
  type PullAppOptions,
  type PullAppResult,
} from '@/application-build/pull/types';
import { type BuildResult } from '@/application-build/types';
import { validateAppPath } from '@/application-build/validate-app-path';
import { ManifestEntityKey } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { applyPullWrites } from '@/cli/utilities/pull/apply-pull-writes';
import { buildManifestEntityLabelByUniversalIdentifier } from '@/cli/utilities/pull/build-manifest-entity-label-by-universal-identifier';
import { planPullWrites } from '@/cli/utilities/pull/plan-pull-writes';
import { planTranslationWrites } from '@/cli/utilities/pull/plan-translation-writes';
import { scanProjectSourceFiles } from '@/cli/utilities/pull/scan-project-source-files';

export const pullApplication = async (
  options: PullAppOptions,
): Promise<BuildResult<PullAppResult>> => {
  const { appPath, signal } = options;
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  try {
    const { applicationExport, target } = await prepareAppPull(options);
    const { manifest } = applicationExport;
    const base = await readTargetBoundPullBase({
      appPath,
      target,
      applicationUniversalIdentifier:
        applicationExport.application.universalIdentifier,
    });
    const scannedFiles = await scanProjectSourceFiles(appPath, {
      includeConfig: true,
    });

    signal?.throwIfAborted();

    const workspaceUniversalIdentifiers = new Set(
      applicationExport.coverage.map((entry) => entry.universalIdentifier),
    );
    const plan = planPullWrites({
      manifest,
      baseManifest: base.manifest,
      scannedFiles,
      workspaceUniversalIdentifiers,
    });
    const protectedIdentifiers = new Set<string>();

    collectIdentifiers(manifest, protectedIdentifiers);
    collectIdentifiers(applicationExport.coverage, protectedIdentifiers);

    const frontComponentSourcePaths = scannedFiles
      .filter((file) => file.entityKey === ManifestEntityKey.FrontComponents)
      .map((file) => join(appPath, file.relativePath));
    const translationPlan = await planTranslationWrites({
      appPath,
      manifest,
      baseManifest: base.manifest,
      frontComponentSourcePaths,
    });
    const coverageIdentifiers = new Set<string>();

    collectIdentifiers(applicationExport.coverage, coverageIdentifiers);

    const safePlan = preserveNestedPullEntities({
      manifest,
      baseManifest: base.manifest,
      coverageIdentifiers,
      writes: plan.writes,
      scannedFiles,
    });
    const writes = [...safePlan.writes, ...translationPlan.writes];
    const deletions = [
      ...plan.deletions.filter(
        (deletion) =>
          !protectedIdentifiers.has(deletion.universalIdentifier.toLowerCase()),
      ),
      ...translationPlan.deletions.filter(
        (deletion) =>
          isDefined(base.manifest?.translations) &&
          deletion.universalIdentifier in base.manifest.translations,
      ),
    ];
    const finalWrite = createPullBaseWrite({ target, manifest });

    await assertPullPaths(appPath, [
      ...writes.map((write) => write.relativePath),
      ...deletions.map((deletion) => deletion.relativePath),
      finalWrite.relativePath,
    ]);

    const overwrittenLocalChanges = await getOverwrittenLocalChanges({
      appPath,
      baseManifest: base.manifest,
      writes,
      deletions,
      frontComponentSourcePaths,
    });
    const entityLabelByUniversalIdentifier =
      buildManifestEntityLabelByUniversalIdentifier(manifest);

    signal?.throwIfAborted();
    await applyPullWrites({ appPath, writes, deletions, finalWrite, signal });

    return {
      success: true,
      data: {
        application: {
          universalIdentifier:
            applicationExport.application.universalIdentifier,
          displayName: applicationExport.application.displayName,
        },
        base: { status: base.status },
        writes: writes.map(({ content: _content, ...write }) => write),
        deletions,
        overwrittenLocalChanges,
        unchangedCount: plan.unchanged.length,
        localOnlyRelativePaths: plan.localOnlyRelativePaths,
        unreadableRelativePaths: scannedFiles
          .filter((file) => !file.isReadable)
          .map((file) => file.relativePath),
        skipped: [...plan.skipped, ...safePlan.skipped],
        compiledTranslationEntryCountByLocale:
          translationPlan.compiledEntryCountByLocale,
        entityLabelByUniversalIdentifier,
      },
      diagnostics: [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code:
          signal?.aborted && Object.is(error, signal.reason)
            ? 'CANCELLED'
            : 'PULL_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics: [],
    };
  }
};
