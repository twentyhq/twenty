import path from 'path';

import { ensureDir, writeJson } from '@/cli/utilities/file/fs-utils';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

export const writeManifestToOutput = async (
  appPath: string,
  manifest: Manifest,
  relativeOutputDir = OUTPUT_DIR,
): Promise<string> => {
  const outputDir = path.join(appPath, relativeOutputDir);
  await ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');
  await writeJson(manifestPath, manifest);

  return manifestPath;
};
