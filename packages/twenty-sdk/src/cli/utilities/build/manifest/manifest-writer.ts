import path from 'path';

import { ensureDir, writeJson } from '@/cli/utilities/file/fs-utils';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

export const writeManifestToOutput = async ({
  appPath,
  manifest,
  relativeOutputDir = OUTPUT_DIR,
}: {
  appPath: string;
  manifest: Manifest;
  relativeOutputDir?: string;
}): Promise<string> => {
  const outputDir = path.join(appPath, relativeOutputDir);
  await ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');
  await writeJson(manifestPath, manifest);

  return manifestPath;
};
