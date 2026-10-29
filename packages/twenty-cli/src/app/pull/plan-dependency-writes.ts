import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { pathExists } from '@/app/fs-utils';
import { type PullWrite } from '@/app/pull/plan-pull-writes';
import { preserveLocalSdkDependency } from '@/app/pull/preserve-local-sdk-dependency';
import { type AppExportFile } from '@/app/types/app-export.type';
import { hashContent } from '@/utils/hash-content';

export const planDependencyWrites = async ({
  appPath,
  files,
  sourceFingerprints = {},
  dependencyFingerprints = {},
}: {
  appPath: string;
  files: AppExportFile[];
  sourceFingerprints?: Record<string, string>;
  dependencyFingerprints?: Record<string, string>;
}) => {
  const writes: PullWrite[] = [];
  const fingerprints: Record<string, string> = {};
  const unchangedSourceFingerprints: Record<string, string> = {};

  for (const { path, content: remoteContent } of files) {
    const absolutePath = join(appPath, path);
    const existingContent = (await pathExists(absolutePath))
      ? await readFile(absolutePath, 'utf8')
      : undefined;
    const fingerprint = hashContent(remoteContent);
    fingerprints[path] = fingerprint;

    if (
      isDefined(existingContent) &&
      (dependencyFingerprints[path] ?? sourceFingerprints[path]) === fingerprint
    ) {
      continue;
    }

    const content =
      path === 'package.json' && isDefined(existingContent)
        ? preserveLocalSdkDependency({
            content: remoteContent,
            existingContent,
          })
        : remoteContent;

    if (existingContent === content) {
      unchangedSourceFingerprints[path] = hashContent(content);
      continue;
    }

    writes.push({
      kind: 'dependency',
      universalIdentifier: `dependencies/${path}`,
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
