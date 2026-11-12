import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { pathExists } from '@/app/fs-utils';
import { type PullWrite, type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';
import { type AppExportFile } from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';
import { hashContent } from '@/utils/hash-content';

export const planFrontComponentWrites = async ({
  appPath,
  manifest,
  baseManifest,
  files,
  scannedFiles,
  protectedIdentifiers,
  reservedPaths,
  remoteSourceFingerprints = {},
  sourceFingerprints = {},
}: {
  appPath: string;
  manifest: Manifest;
  baseManifest: Manifest | null;
  files: AppExportFile[];
  scannedFiles: ScannedSourceFile[];
  protectedIdentifiers: ReadonlySet<string>;
  reservedPaths: ReadonlySet<string>;
  remoteSourceFingerprints?: Record<string, string>;
  sourceFingerprints?: Record<string, string>;
}) => {
  const writes: PullWrite[] = [];
  const deletions: PullDeletion[] = [];
  let unchangedCount = 0;
  const fingerprints: Record<string, string> = {};
  const unchangedSourceFingerprints: Record<string, string> = {};
  const usedPaths = new Set(reservedPaths);
  for (const component of manifest.frontComponents ?? []) {
    const { universalIdentifier, sourceComponentPath } = component;
    const file = files.find(
      (file) =>
        file.folder === FileFolder.Source && file.path === sourceComponentPath,
    );
    const existing = scannedFiles.find(
      (file) =>
        file.entityKey === 'frontComponents' &&
        file.universalIdentifier?.toLowerCase() ===
          universalIdentifier.toLowerCase(),
    );
    const relativePath = (existing?.relativePath ?? sourceComponentPath)
      .split('\\')
      .join('/');
    const pathKey = relativePath.toLowerCase();
    const existingContent = (await pathExists(join(appPath, relativePath)))
      ? await readFile(join(appPath, relativePath), 'utf8')
      : undefined;
    if (
      !isDefined(file) ||
      usedPaths.has(pathKey) ||
      (isDefined(existingContent) && !isDefined(existing))
    ) {
      throw new CliError({
        code: 'CONFLICT',
        message: !isDefined(file)
          ? `Source for front component ${universalIdentifier} was not exported. No local files were changed.`
          : `Cannot restore front component ${universalIdentifier}: ${relativePath} is occupied by another local file or definition. No local files were changed.`,
      });
    }
    usedPaths.add(pathKey);
    const fingerprint = hashContent(file.content);
    fingerprints[sourceComponentPath] = fingerprint;
    if (existingContent === file.content) {
      unchangedSourceFingerprints[relativePath] = fingerprint;
    }
    const previous = baseManifest?.frontComponents?.find(
      (entry) =>
        entry.universalIdentifier.toLowerCase() ===
        universalIdentifier.toLowerCase(),
    );
    const previousFingerprint =
      (isDefined(previous)
        ? remoteSourceFingerprints[previous.sourceComponentPath]
        : undefined) ?? sourceFingerprints[relativePath];
    if (
      existingContent === file.content ||
      (isDefined(existingContent) &&
        isDefined(previous) &&
        (isDefined(previousFingerprint)
          ? previousFingerprint === fingerprint
          : JSON.stringify(previous) === JSON.stringify(component)))
    ) {
      unchangedCount++;
      continue;
    }
    writes.push({
      kind: 'frontComponent',
      universalIdentifier,
      relativePath,
      content: file.content,
      requiredSdkExports: ['defineFrontComponent'],
      isRegeneration: isDefined(existingContent),
    });
  }
  for (const previous of baseManifest?.frontComponents ?? []) {
    if (protectedIdentifiers.has(previous.universalIdentifier.toLowerCase())) {
      const previousFingerprint =
        remoteSourceFingerprints[previous.sourceComponentPath];
      if (
        !isDefined(previousFingerprint) ||
        manifest.frontComponents?.some(
          (component) =>
            component.universalIdentifier.toLowerCase() ===
            previous.universalIdentifier.toLowerCase(),
        )
      ) {
        continue;
      }
      fingerprints[previous.sourceComponentPath] = previousFingerprint;
      continue;
    }
    const existing = scannedFiles.find(
      (file) =>
        file.entityKey === 'frontComponents' &&
        file.universalIdentifier?.toLowerCase() ===
          previous.universalIdentifier.toLowerCase(),
    );
    const relativePath = existing?.relativePath.split('\\').join('/');
    if (isDefined(relativePath) && !usedPaths.has(relativePath.toLowerCase())) {
      deletions.push({
        universalIdentifier: previous.universalIdentifier,
        relativePath,
      });
    }
  }
  return {
    writes,
    deletions,
    unchangedCount,
    fingerprints,
    unchangedSourceFingerprints,
  };
};
