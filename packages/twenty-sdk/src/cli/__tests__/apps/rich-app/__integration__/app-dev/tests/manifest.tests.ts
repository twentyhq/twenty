import * as fs from 'fs-extra';
import { join } from 'path';

import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { EXPECTED_MANIFEST } from '../expected-manifest';

export const defineManifestTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  describe('manifest', () => {
    it('should build manifest matching expected JSON', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest).not.toBeNull();

      expect(manifest.objects).toHaveLength(4);
      expect(manifest.logicFunctions).toHaveLength(6);
      expect(manifest.frontComponents).toHaveLength(4);
      expect(manifest.roles).toHaveLength(2);
      expect(manifest.fields).toHaveLength(26);
      expect(manifest.views).toHaveLength(3);
      expect(manifest.navigationMenuItems).toHaveLength(3);

      expect(normalizeManifestForComparison(manifest)).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );
    });
  });
};
