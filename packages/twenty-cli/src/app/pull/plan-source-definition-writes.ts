import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { pathExists } from '@/app/fs-utils';
import { getPullSourceDefinitions } from '@/app/pull/get-pull-source-definitions';
import { type PullWrite, type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';
import { type AppExportFile } from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';
import { hashContent } from '@/utils/hash-content';

export const planSourceDefinitionWrites = async ({
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
  const definitions = getPullSourceDefinitions(manifest);
  const previousDefinitions = getPullSourceDefinitions(baseManifest);
  for (const resource of definitions) {
    const { sourcePath } = resource;
    const { universalIdentifier } = resource.definition;
    const file = files.find(
      (file) => file.folder === FileFolder.Source && file.path === sourcePath,
    );
    const existing = scannedFiles.find(
      (file) =>
        file.entityKey === resource.entityKey &&
        file.universalIdentifier?.toLowerCase() ===
          universalIdentifier.toLowerCase(),
    );
    if (
      isDefined(resource.sourceFiles) &&
      isDefined(existing) &&
      existing.relativePath.split('\\').join('/') !== sourcePath
    ) {
      throw new CliError({
        code: 'CONFLICT',
        message: `${resource.label} ${universalIdentifier} moved locally. Restore it to ${sourcePath} before pulling its imported files.`,
      });
    }
    const relativePath = (existing?.relativePath ?? sourcePath)
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
          ? `Source for ${resource.label.toLowerCase()} ${universalIdentifier} was not exported. No local files were changed.`
          : `Cannot restore ${resource.label.toLowerCase()} ${universalIdentifier}: ${relativePath} is occupied by another local file or definition. No local files were changed.`,
      });
    }
    usedPaths.add(pathKey);
    const content = Buffer.from(
      file.content,
      file.encoding === 'base64' ? 'base64' : 'utf8',
    ).toString('utf8');
    const fingerprint = hashContent(content);
    fingerprints[sourcePath] = fingerprint;
    if (existingContent === content) {
      unchangedSourceFingerprints[relativePath] = fingerprint;
    }
    const previous = previousDefinitions.find(
      (entry) =>
        entry.definition.universalIdentifier.toLowerCase() ===
        universalIdentifier.toLowerCase(),
    );
    const previousFingerprint =
      (isDefined(previous)
        ? remoteSourceFingerprints[previous.sourcePath]
        : undefined) ?? sourceFingerprints[relativePath];
    if (
      existingContent === content ||
      (isDefined(existingContent) &&
        isDefined(previous) &&
        (isDefined(previousFingerprint)
          ? previousFingerprint === fingerprint
          : JSON.stringify(previous.definition) ===
            JSON.stringify(resource.definition)))
    ) {
      unchangedCount++;
      continue;
    }
    writes.push({
      kind: resource.kind,
      universalIdentifier,
      relativePath,
      content,
      requiredSdkExports: resource.requiredSdkExports,
      isRegeneration: isDefined(existingContent),
    });
  }
  for (const previous of previousDefinitions) {
    if (
      protectedIdentifiers.has(
        previous.definition.universalIdentifier.toLowerCase(),
      )
    ) {
      const previousFingerprint = remoteSourceFingerprints[previous.sourcePath];
      if (
        !isDefined(previousFingerprint) ||
        definitions.some(
          (resource) =>
            resource.definition.universalIdentifier.toLowerCase() ===
            previous.definition.universalIdentifier.toLowerCase(),
        )
      ) {
        continue;
      }
      fingerprints[previous.sourcePath] = previousFingerprint;
      continue;
    }
    const existing = scannedFiles.find(
      (file) =>
        file.entityKey === previous.entityKey &&
        file.universalIdentifier?.toLowerCase() ===
          previous.definition.universalIdentifier.toLowerCase(),
    );
    const relativePath = existing?.relativePath.split('\\').join('/');
    if (isDefined(relativePath) && !usedPaths.has(relativePath.toLowerCase())) {
      deletions.push({
        universalIdentifier: previous.definition.universalIdentifier,
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
