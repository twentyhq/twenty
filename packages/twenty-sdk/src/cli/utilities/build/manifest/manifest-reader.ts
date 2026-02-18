import * as fs from 'fs-extra';
import path from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

export const readManifestFromFile = async (
  appPath: string,
): Promise<Manifest | null> => {
  const outputDir = path.join(appPath, OUTPUT_DIR);
  await fs.ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');

  if (!(await fs.pathExists(manifestPath))) {
    const { manifest } = await buildManifest(appPath);

    return manifest;
  }

  return await fs.readJson(manifestPath);
};
