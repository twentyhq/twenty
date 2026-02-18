import * as fs from 'fs-extra';
import path from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

export const readManifestFromFile = async (
  appPath: string,
): Promise<Manifest> => {
  const outputDir = path.join(appPath, OUTPUT_DIR);
  await fs.ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');
  return await fs.readJson(manifestPath);
};
