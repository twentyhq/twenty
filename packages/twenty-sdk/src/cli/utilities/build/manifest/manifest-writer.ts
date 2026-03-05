import path from 'path';

import { ensureDir, writeJSON } from '@/cli/utilities/file/fs-utils';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

export const writeManifestToOutput = async (
  appPath: string,
  manifest: Manifest,
): Promise<string> => {
  const outputDir = path.join(appPath, OUTPUT_DIR);
  await ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');
  await writeJSON(manifestPath, manifest);

  return manifestPath;
};
