import { join } from 'path';
import { type Manifest } from 'twenty-shared/application';

import { EXPECTED_MANIFEST } from '@/cli/__tests__/apps/minimal-app/__integration__/app-dev/expected-manifest';
import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';

export const defineManifestTests = (appPath: string): void => {
  describe('manifest', () => {
    it('should have generated manifest.json', async () => {
      const manifestPath = join(appPath, '.twenty/output/manifest.json');
      const exists = await pathExists(manifestPath);

      expect(exists).toBe(true);
    });

    it('should have correct manifest content', async () => {
      const manifestPath = join(appPath, '.twenty/output/manifest.json');
      const manifest = normalizeManifestForComparison(
        await readJson<Manifest>(manifestPath),
      );

      expect(manifest).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );
    });
  });
};
