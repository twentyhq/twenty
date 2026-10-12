import { fileURLToPath } from 'node:url';

import { generateTemplateLock, TemplateLockError } from './template-lock.mjs';

try {
  const { version, firstPartyPackages, resolutionCount } =
    await generateTemplateLock({
      packageDirectory: fileURLToPath(new URL('..', import.meta.url)),
    });

  console.log(
    `Wrote dist/app-template/yarn.lock with ${resolutionCount} resolutions, pinning ${firstPartyPackages.map((name) => `${name}@${version}`).join(', ')}`,
  );
} catch (error) {
  if (!(error instanceof TemplateLockError)) {
    throw error;
  }

  console.error(`Template lockfile failed: ${error.message}`);
  process.exitCode = 1;
}
