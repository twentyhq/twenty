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

      const { sources: _sources, ...sanitizedManifest } = manifest;

      expect(normalizeManifestForComparison(sanitizedManifest)).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );

      for (const fn of manifest.logicFunctions) {
        expect(fn.builtHandlerChecksum).toBeDefined();
        expect(fn.builtHandlerChecksum).not.toBeNull();
        expect(typeof fn.builtHandlerChecksum).toBe('string');
      }

      for (const component of manifest.frontComponents ?? []) {
        expect(component.builtComponentChecksum).toBeDefined();
        expect(component.builtComponentChecksum).not.toBeNull();
        expect(typeof component.builtComponentChecksum).toBe('string');
      }
    });

    it('should have correct application config', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest?.application.displayName).toBe('Rich App');
      expect(manifest?.application.description).toBe('A simple rich app');
    });

    it('should load all entity types', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest.objects).toHaveLength(4);
      expect(manifest.logicFunctions).toHaveLength(6);
      expect(manifest.frontComponents).toHaveLength(4);
      expect(manifest.roles).toHaveLength(2);
      expect(manifest.fields).toHaveLength(6);
      expect(manifest.views).toHaveLength(3);
      expect(manifest.navigationMenuItems).toHaveLength(3);
    });
  });
};
