import { join } from 'path';

import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { readJson } from '@/cli/utilities/file/fs-utils';
import { type Manifest } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { EXPECTED_MANIFEST } from '../expected-manifest';

export const defineManifestTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  let manifest: Manifest;

  beforeAll(async () => {
    manifest = await readJson<Manifest>(manifestOutputPath);
  });

  describe('manifest', () => {
    it('should build manifest matching expected JSON', () => {
      expect(manifest).not.toBeNull();

      expect(manifest.objects).toHaveLength(4);
      expect(manifest.logicFunctions).toHaveLength(7);
      expect(manifest.frontComponents).toHaveLength(4);
      expect(manifest.roles).toHaveLength(2);
      expect(manifest.fields).toHaveLength(7);
      expect(manifest.views).toHaveLength(5);
      expect(manifest.navigationMenuItems).toHaveLength(1);
      expect(manifest.pageLayoutTabs).toHaveLength(1);

      expect(normalizeManifestForComparison(manifest)).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );
    });
  });

  describe('navigationMenuItems', () => {
    // OBJECT items are provisioned by the metadata side-effect engine, so an
    // app manifest only declares the variants it owns.
    it('should include all navigation menu items with correct types', () => {
      expect(manifest.navigationMenuItems).toHaveLength(1);

      for (const item of manifest.navigationMenuItems) {
        expect(item.type).toBe(NavigationMenuItemType.LINK);
        expect(item.universalIdentifier).toBeDefined();
        expect(typeof item.position).toBe('number');
        expect(item.link).toBeDefined();
      }
    });

    it('should have unique positions', () => {
      const positions = manifest.navigationMenuItems.map(
        (item) => item.position,
      );

      expect(new Set(positions).size).toBe(positions.length);
    });

    it('should have unique universal identifiers', () => {
      const identifiers = manifest.navigationMenuItems.map(
        (item) => item.universalIdentifier,
      );

      expect(new Set(identifiers).size).toBe(identifiers.length);
    });
  });
};
