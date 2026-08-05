import { rm } from 'node:fs/promises';
import { join } from 'path';

import { OUTPUT_DIR } from 'twenty-shared/application';

// Specs share the fixture application, so each one removes only the bundle it
// built: emptying the whole output directory would delete artifacts a spec
// running in parallel still depends on.
export const removeBuiltVendorBundle = async ({
  appPath,
  builtVendorPath,
}: {
  appPath: string;
  builtVendorPath: string;
}): Promise<void> => {
  const absoluteBuiltPath = join(appPath, OUTPUT_DIR, builtVendorPath);

  await rm(absoluteBuiltPath, { force: true });
  await rm(`${absoluteBuiltPath}.map`, { force: true });
};
