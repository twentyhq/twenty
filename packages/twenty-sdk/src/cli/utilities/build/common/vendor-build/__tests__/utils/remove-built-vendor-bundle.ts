import { rm } from 'node:fs/promises';
import { join } from 'path';

import { OUTPUT_DIR } from 'twenty-shared/application';

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
