import { fileURLToPath } from 'node:url';

import {
  checkPublishReadiness,
  PublishCheckError,
} from './check-publish-readiness.mjs';
import { generateTemplateLock, TemplateLockError } from './template-lock.mjs';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));

try {
  const { version, executable, bundleFileCount, templateFileCount, pins } =
    await checkPublishReadiness({ packageDirectory });
  const pinList = pins
    .map(({ name, version: pinnedVersion }) => `${name}@${pinnedVersion}`)
    .join(', ');

  console.log(`twenty ${version} is ready to publish:`);
  console.log(
    `  ${executable}, the app worker, ${bundleFileCount} bundle files and ${templateFileCount} template files are present`,
  );
  console.log(`  app init pins ${pinList}, all on npm`);

  const { resolutionCount } = await generateTemplateLock({
    packageDirectory,
    pins,
  });

  console.log(
    `Wrote dist/app-template/yarn.lock with ${resolutionCount} resolutions, pinning ${pinList}`,
  );
} catch (error) {
  if (error instanceof PublishCheckError) {
    console.error(`Publish check failed: ${error.message}`);
    process.exitCode = 1;
  } else if (error instanceof TemplateLockError) {
    console.error(`Template lockfile failed: ${error.message}`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
