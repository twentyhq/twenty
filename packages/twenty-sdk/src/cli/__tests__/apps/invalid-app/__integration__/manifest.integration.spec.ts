import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { join } from 'path';

const APP_PATH = join(__dirname, '..');

describe('invalid-app manifest', () => {
  it('should fail to build manifest due to duplicate universalIdentifier', async () => {
    const manifest = await runManifestBuild(APP_PATH, {
      display: false,
      writeOutput: false,
    });

    // Manifest should be null because validation fails
    expect(manifest).toBeNull();
  });
});
