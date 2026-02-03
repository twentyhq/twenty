import { runAppDev } from '@/cli/__tests__/integration/utils/run-app-dev.util';
import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';

const APP_PATH = join(__dirname, '..');
const MANIFEST_OUTPUT_PATH = join(APP_PATH, OUTPUT_DIR, 'ioi', 'manifest.json');

describe('invalid-app manifest', () => {
  it('should fail to build manifest due to duplicate universalIdentifier', async () => {
    const result = await runAppDev({ appPath: APP_PATH, timeout: 10000 });

    expect(result.success).toBe(false);
    expect(result.output).toContain('Duplicate universal identifiers');

    const manifestExists = await fs.pathExists(MANIFEST_OUTPUT_PATH);

    expect(manifestExists).toBe(false);
  }, 30000);
});
