import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { pathExists } from '@/app/fs-utils';
import { getPullSourceDefinitions } from '@/app/pull/get-pull-source-definitions';
import { type PullWrite } from '@/app/pull/plan-pull-writes';
import { type AppExportFile } from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';
import { hashContent } from '@/utils/hash-content';

export const planApplicationSourceWrites = async ({
  appPath,
  manifest,
  files,
  reservedPaths,
  remoteSourceFingerprints = {},
  sourceFingerprints = {},
}: {
  appPath: string;
  manifest: Pick<Manifest, 'frontComponents' | 'logicFunctions'>;
  files: AppExportFile[];
  reservedPaths: ReadonlySet<string>;
  remoteSourceFingerprints?: Record<string, string>;
  sourceFingerprints?: Record<string, string>;
}) => {
  const entryPaths = new Set(
    getPullSourceDefinitions(manifest).map(
      (definition) => definition.sourcePath,
    ),
  );
  const writes: PullWrite<Buffer>[] = [];
  const fingerprints: Record<string, string> = {};
  const unchangedSourceFingerprints: Record<string, string> = {};
  let unchangedCount = 0;
  for (const file of files.filter(
    (file) => file.folder === FileFolder.Source && !entryPaths.has(file.path),
  )) {
    const content = Buffer.from(
      file.content,
      file.encoding === 'base64' ? 'base64' : 'utf8',
    );
    const fingerprint = hashContent(content);
    const existingContent = (await pathExists(join(appPath, file.path)))
      ? await readFile(join(appPath, file.path))
      : undefined;
    if (
      reservedPaths.has(file.path.toLowerCase()) ||
      (isDefined(existingContent) &&
        !existingContent.equals(content) &&
        !isDefined(
          remoteSourceFingerprints[file.path] ?? sourceFingerprints[file.path],
        ) &&
        file.path !== 'tsconfig.json')
    ) {
      throw new CliError({
        code: 'CONFLICT',
        message: `Cannot restore source ${file.path}: it is occupied by another local file or definition. No local files were changed.`,
      });
    }
    fingerprints[file.path] = fingerprint;
    if (existingContent?.equals(content)) {
      unchangedSourceFingerprints[file.path] = fingerprint;
      unchangedCount++;
      continue;
    }
    if (
      isDefined(existingContent) &&
      (remoteSourceFingerprints[file.path] ?? sourceFingerprints[file.path]) ===
        fingerprint
    ) {
      unchangedCount++;
      continue;
    }
    writes.push({
      kind: 'source',
      universalIdentifier: `source/${file.path}`,
      relativePath: file.path,
      content,
      requiredSdkExports: [],
      isRegeneration: isDefined(existingContent),
    });
  }
  return { writes, fingerprints, unchangedSourceFingerprints, unchangedCount };
};
