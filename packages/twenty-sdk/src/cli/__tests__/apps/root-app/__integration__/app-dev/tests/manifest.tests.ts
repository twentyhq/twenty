import * as fs from 'fs-extra';
import { join } from 'path';
import { type Manifest } from 'twenty-shared/application';

import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { EXPECTED_MANIFEST } from '@/cli/__tests__/apps/root-app/__integration__/app-dev/expected-manifest';

export const defineManifestTests = (appPath: string): void => {
  describe('manifest', () => {
    it('should have generated manifest.json', async () => {
      const manifestPath = join(appPath, '.twenty/output/manifest.json');
      const exists = await fs.pathExists(manifestPath);

      expect(exists).toBe(true);
    });

    it('should have correct manifest content', async () => {
      const manifestPath = join(appPath, '.twenty/output/manifest.json');
      const manifest: Manifest = normalizeManifestForComparison(
        await fs.readJSON(manifestPath),
      );

      expect(manifest).toEqual(EXPECTED_MANIFEST);
    });
  });
};
