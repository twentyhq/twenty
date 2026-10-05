import { join } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { collectIdentifiers } from '@/app/pull/collect-identifiers';
import { getOverwrittenLocalChanges } from '@/app/pull/get-overwritten-local-changes';
import { prepareAppPull } from '@/app/pull/prepare-app-pull';
import { preserveNestedPullEntities } from '@/app/pull/preserve-nested-pull-entities';
import { reconcilePullBaseManifest } from '@/app/pull/reconcile-pull-base-manifest';
import { createPullBaseWrite } from '@/app/pull/create-pull-base-write';
import { readTargetBoundPullBase } from '@/app/pull/read-target-bound-pull-base';
import { type PullAppOptions, type PullAppResult } from '@/app/pull/types';
import { type ToolingResult } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { toPullManifest } from '@/app/pull/to-pull-manifest';
import { assertPullSdkExports } from '@/app/pull/assert-pull-sdk-exports';
import { applyPullWrites } from '@/app/pull/apply-pull-writes';
import { buildManifestEntityLabelByUniversalIdentifier } from '@/app/pull/build-manifest-entity-label-by-universal-identifier';
import { planPullWrites } from '@/app/pull/plan-pull-writes';
import { planTranslationWrites } from '@/app/pull/plan-translation-writes';
import { scanProjectSourceFiles } from '@/app/source/scan-project-source-files';
import { updateSourceFingerprints } from '@/app/pull/update-source-fingerprints';

export const pullApplication = async (
  options: PullAppOptions,
): Promise<ToolingResult<PullAppResult>> => {
  const { appPath, signal } = options;
  try {
    const { applicationExport, target } = await prepareAppPull(options);
    const manifest = toPullManifest(applicationExport.manifest);
    const base = await readTargetBoundPullBase({
      appPath,
      target,
      applicationUniversalIdentifier:
        applicationExport.application.universalIdentifier,
    });
    const baseManifest = isDefined(base.manifest)
      ? toPullManifest(base.manifest)
      : null;
    const scannedFiles = await scanProjectSourceFiles({
      appPath,
      includeConfig: true,
      signal,
    });

    signal?.throwIfAborted();

    const workspaceUniversalIdentifiers = new Set(
      applicationExport.coverage.map((entry) => entry.universalIdentifier),
    );
    const plan = planPullWrites({
      manifest,
      baseManifest,
      scannedFiles,
      workspaceUniversalIdentifiers,
      unreconciledUniversalIdentifiers: new Set(
        base.unreconciledUniversalIdentifiers,
      ),
    });
    const protectedIdentifiers = new Set<string>();

    collectIdentifiers({ value: manifest, identifiers: protectedIdentifiers });
    collectIdentifiers({
      value: applicationExport.coverage,
      identifiers: protectedIdentifiers,
    });

    const frontComponentSourcePaths = scannedFiles
      .filter((file) => file.entityKey === 'frontComponents')
      .map((file) => join(appPath, file.relativePath));
    const translationPlan = await planTranslationWrites({
      appPath,
      manifest,
      baseManifest,
      frontComponentSourcePaths,
    });
    const coverageIdentifiers = new Set<string>();

    collectIdentifiers({
      value: applicationExport.coverage,
      identifiers: coverageIdentifiers,
    });

    const safePlan = preserveNestedPullEntities({
      manifest,
      baseManifest,
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
          isDefined(baseManifest?.translations) &&
          deletion.universalIdentifier in baseManifest.translations,
      ),
    ];
    const skipped = [...plan.skipped, ...safePlan.skipped];
    const unreconciledUniversalIdentifiers = new Set(
      skipped.map((entry) => entry.universalIdentifier.toLowerCase()),
    );
    const finalWrite = createPullBaseWrite({
      target,
      manifest: reconcilePullBaseManifest({
        manifest: applicationExport.manifest,
        baseManifest: base.manifest,
        unreconciledUniversalIdentifiers,
        protectedIdentifiers,
      }),
      unreconciledUniversalIdentifiers: [...unreconciledUniversalIdentifiers],
      sourceFingerprints: updateSourceFingerprints({
        sourceFingerprints: base.sourceFingerprints,
        writes,
        deletions,
      }),
    });

    await assertPullPaths({
      appPath,
      relativePaths: [
        ...writes.map((write) => write.relativePath),
        ...deletions.map((deletion) => deletion.relativePath),
        finalWrite.relativePath,
      ],
    });

    const overwrittenLocalChanges = await getOverwrittenLocalChanges({
      appPath,
      baseManifest,
      writes,
      deletions,
      frontComponentSourcePaths,
      unreconciledUniversalIdentifiers: new Set(
        base.unreconciledUniversalIdentifiers,
      ),
      sourceFingerprints: base.sourceFingerprints,
    });
    const entityLabelByUniversalIdentifier =
      buildManifestEntityLabelByUniversalIdentifier(manifest);

    assertPullSdkExports({ appPath, writes });
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
        writes: writes.map(
          ({
            content: _content,
            requiredSdkExports: _requiredSdkExports,
            ...write
          }) => write,
        ),
        deletions,
        overwrittenLocalChanges,
        unchangedCount: plan.unchanged.length,
        localOnlyRelativePaths: plan.localOnlyRelativePaths,
        unreadableRelativePaths: scannedFiles
          .filter((file) => !file.isReadable)
          .map((file) => file.relativePath),
        skipped,
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
            : error instanceof CliError
              ? error.code
              : 'PULL_FAILED',
        message: error instanceof Error ? error.message : String(error),
        ...getToolingErrorContext(error),
        details: {
          outcome: 'unchanged',
          ...(error instanceof CliError ? error.details : {}),
        },
      },
      diagnostics: [],
    };
  }
};
