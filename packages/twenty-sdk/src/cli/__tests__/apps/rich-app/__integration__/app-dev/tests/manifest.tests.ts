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

      for (const fn of manifest.entities.logicFunctions) {
        expect(fn.builtHandlerChecksum).toBeDefined();
        expect(fn.builtHandlerChecksum).not.toBeNull();
        expect(typeof fn.builtHandlerChecksum).toBe('string');
      }

      for (const component of manifest.entities.frontComponents ?? []) {
        expect(component.builtComponentChecksum).toBeDefined();
        expect(component.builtComponentChecksum).not.toBeNull();
        expect(typeof component.builtComponentChecksum).toBe('string');
      }
    });

    it('should have correct application config', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest?.application.displayName).toBe('Hello World');
      expect(manifest?.application.description).toBe(
        'A simple hello world app',
      );
    });

    it('should load all entity types', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest?.entities.objects).toHaveLength(2);
      expect(manifest?.entities.logicFunctions).toHaveLength(4);
      expect(manifest?.entities.frontComponents).toHaveLength(4);
      expect(manifest?.entities.roles).toHaveLength(2);
      expect(manifest?.entities.objectExtensions).toHaveLength(1);
    });
  });
};
