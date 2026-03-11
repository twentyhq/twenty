import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';

import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { INVALID_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

const MANIFEST_OUTPUT_PATH = join(
  INVALID_APP_PATH,
  OUTPUT_DIR,
  'manifest.json',
);

describe('invalid-app manifest', () => {
  it('should fail to build manifest due to duplicate universalIdentifier', async () => {
    const result = await runAppDevInProcess({
      appPath: INVALID_APP_PATH,
      timeout: 10000,
    });

    expect(result.success).toBe(false);

    const manifestExists = await pathExists(MANIFEST_OUTPUT_PATH);

    expect(manifestExists).toBe(false);
  }, 30000);
});
