import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { ensureDir, pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import path from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

export const readManifestFromFile = async (
  appPath: string,
): Promise<Manifest | null> => {
  const outputDir = path.join(appPath, OUTPUT_DIR);
  await ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');

  if (!(await pathExists(manifestPath))) {
    const { manifest } = await buildManifest(appPath);

    return manifest;
  }

  return await readJson(manifestPath);
};
