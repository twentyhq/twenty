import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { pathExists } from '@/app/fs-utils';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { type PullWrite } from '@/app/pull/plan-pull-writes';
import { type AppExportFile } from '@/app/types/app-export.type';
import { hashContent } from '@/utils/hash-content';

export const planPublicAssetWrites = async ({
  appPath,
  files,
  sourceFingerprints = {},
  publicAssetFingerprints = {},
}: {
  appPath: string;
  files: AppExportFile[];
  sourceFingerprints?: Record<string, string>;
  publicAssetFingerprints?: Record<string, string>;
}) => {
  await assertPullPaths({
    appPath,
    relativePaths: files.map(({ path }) => path),
  });

  const writes: PullWrite<Buffer>[] = [];
  const fingerprints: Record<string, string> = {};
  const unchangedSourceFingerprints: Record<string, string> = {};

  for (const { path, content: encodedContent } of files) {
    const content = Buffer.from(encodedContent, 'base64');
    const fingerprint = hashContent(content);
    fingerprints[path] = fingerprint;
    const absolutePath = join(appPath, path);
    const existingContent = (await pathExists(absolutePath))
      ? await readFile(absolutePath)
      : undefined;

    if (
      isDefined(existingContent) &&
      (publicAssetFingerprints[path] ?? sourceFingerprints[path]) ===
        fingerprint
    ) {
      continue;
    }

    if (existingContent?.equals(content)) {
      unchangedSourceFingerprints[path] = fingerprint;
      continue;
    }

    writes.push({
      kind: 'publicAsset',
      universalIdentifier: `public-asset/${path}`,
      relativePath: path,
      content,
      requiredSdkExports: [],
      isRegeneration: isDefined(existingContent),
    });
  }

  return {
    writes,
    fingerprints,
    unchangedSourceFingerprints,
    unchangedCount: files.length - writes.length,
  };
};
