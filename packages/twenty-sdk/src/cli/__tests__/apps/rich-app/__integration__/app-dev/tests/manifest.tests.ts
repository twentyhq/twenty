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
      expect(manifest.logicFunctions).toHaveLength(6);
      expect(manifest.frontComponents).toHaveLength(4);
      expect(manifest.roles).toHaveLength(2);
      expect(manifest.fields).toHaveLength(23);
      expect(manifest.views).toHaveLength(3);
      expect(manifest.navigationMenuItems).toHaveLength(3);

      expect(normalizeManifestForComparison(manifest)).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );
    });
  });

  describe('navigationMenuItems', () => {
    it('should include all navigation menu items with correct types', () => {
      expect(manifest.navigationMenuItems).toHaveLength(3);

      for (const item of manifest.navigationMenuItems) {
        expect(item.type).toBe(NavigationMenuItemType.OBJECT);
        expect(item.universalIdentifier).toBeDefined();
        expect(typeof item.position).toBe('number');
        expect(item.targetObjectUniversalIdentifier).toBeDefined();
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

    it('should reference valid object universal identifiers', () => {
      const objectIdentifiers = new Set(
        manifest.objects.map((obj) => obj.universalIdentifier),
      );

      for (const item of manifest.navigationMenuItems) {
        expect(objectIdentifiers).toContain(
          item.targetObjectUniversalIdentifier,
        );
      }
    });
  });
};
