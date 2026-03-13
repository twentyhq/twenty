import { join } from 'path';

import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { readJson } from '@/cli/utilities/file/fs-utils';
import { type Manifest } from 'twenty-shared/application';
import { EXPECTED_MANIFEST } from '../expected-manifest';

export const defineManifestTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  describe('manifest', () => {
    it('should build manifest matching expected JSON', async () => {
      const manifest = await readJson<Manifest>(manifestOutputPath);

      expect(manifest).not.toBeNull();

      expect(manifest.objects).toHaveLength(1);
      expect(manifest.logicFunctions).toHaveLength(3);
      expect(manifest.frontComponents).toHaveLength(1);
      expect(manifest.roles).toHaveLength(1);
      expect(manifest.skills).toHaveLength(1);
      expect(manifest.fields).toHaveLength(6);
      expect(manifest.views).toHaveLength(1);
      expect(manifest.navigationMenuItems).toHaveLength(1);

      expect(normalizeManifestForComparison(manifest)).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );
    });
  });
};
