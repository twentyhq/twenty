import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';

const APP_PATH = join(__dirname, '..');
const MANIFEST_OUTPUT_PATH = join(APP_PATH, OUTPUT_DIR, 'manifest.json');

describe('invalid-app manifest', () => {
  it('should fail to build manifest due to duplicate universalIdentifier', async () => {
    const result = await buildManifest(APP_PATH);

    expect(result.manifest).not.toBeNull();

    const validation = manifestValidate(result.manifest!);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.join(', ')).toContain(
      'Duplicate universal identifiers',
    );

    const manifestExists = await fs.pathExists(MANIFEST_OUTPUT_PATH);

    expect(manifestExists).toBe(false);
  }, 30000);
});
