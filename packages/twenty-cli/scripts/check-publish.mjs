import { fileURLToPath } from 'node:url';

import {
  checkPublishReadiness,
  PublishCheckError,
} from './check-publish-readiness.mjs';

try {
  const { version, executable, bundleFileCount, templateFileCount, pins } =
    await checkPublishReadiness({
      packageDirectory: fileURLToPath(new URL('..', import.meta.url)),
    });

  console.log(`twenty ${version} is ready to publish:`);
  console.log(
    `  ${executable}, the app worker, ${bundleFileCount} bundle files and ${templateFileCount} template files are present`,
  );
  console.log(
    `  app init pins ${pins.map(({ name, version: pinnedVersion }) => `${name}@${pinnedVersion}`).join(', ')}, all on npm`,
  );
} catch (error) {
  if (!(error instanceof PublishCheckError)) {
    throw error;
  }

  console.error(`Publish check failed: ${error.message}`);
  process.exitCode = 1;
}
