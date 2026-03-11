import path from 'path';

import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';

const FIXTURE_APPS = ['hello-world-app', 'postcard-app', 'minimal-app'];

const buildFixture = async (fixtureName: string): Promise<void> => {
  const appPath = path.resolve(__dirname, fixtureName);

  console.log(`\n--- Building fixture: ${fixtureName} ---`);
  console.log(`  App path: ${appPath}`);

  const manifestResult = await buildAndValidateManifest(appPath);

  if (!manifestResult.success) {
    console.error(`  FAILED to build manifest: ${manifestResult.errors.join(', ')}`);

    return;
  }

  const { manifest, filePaths } = manifestResult;

  for (const warning of manifestResult.warnings) {
    console.warn(`  Warning: ${warning}`);
  }

  const buildResult = await buildApplication({ appPath, manifest, filePaths });

  const updatedManifest = manifestUpdateChecksums({
    manifest,
    builtFileInfos: buildResult.builtFileInfos,
  });

  await writeManifestToOutput(appPath, updatedManifest);

  console.log(`  Built ${buildResult.builtFileInfos.size} files`);
  console.log(`  Output: ${path.join(appPath, '.twenty', 'output')}`);
};

const main = async () => {
  for (const fixture of FIXTURE_APPS) {
    await buildFixture(fixture);
  }

  console.log('\nDone.');
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
