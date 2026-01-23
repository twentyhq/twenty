import * as fs from 'fs-extra';
import path from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';

export const writeManifestToOutput = async (
  appPath: string,
  manifest: ApplicationManifest,
): Promise<string> => {
  const outputDir = path.join(appPath, OUTPUT_DIR);
  await fs.ensureDir(outputDir);

  const manifestPath = path.join(outputDir, 'manifest.json');
  await fs.writeJSON(manifestPath, manifest, { spaces: 2 });

  return manifestPath;
};
