import * as fs from 'fs-extra';
import path from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

export const writeManifestToOutput = async (
  appPath: string,
  manifest: Manifest,
): Promise<string> => {
  const outputDir = path.join(appPath, OUTPUT_DIR);
  await fs.ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');
  await fs.writeJSON(manifestPath, manifest, { spaces: 2 });

  return manifestPath;
};
