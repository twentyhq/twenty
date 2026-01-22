import * as fs from 'fs-extra';
import { join } from 'path';

import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import expectedManifest from '../manifest.expected.json';

export const defineManifestTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  describe('manifest', () => {
    it('should build manifest matching expected JSON', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest).not.toBeNull();

      const { sources: _sources, ...sanitizedManifest } = manifest;

      expect(normalizeManifestForComparison(sanitizedManifest)).toEqual(
        normalizeManifestForComparison(expectedManifest),
      );

      for (const fn of manifest.functions) {
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

      expect(manifest?.application.displayName).toBe('Hello World');
      expect(manifest?.application.description).toBe('A simple hello world app');
    });

    it('should load all entity types', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest?.objects).toHaveLength(2);
      expect(manifest?.functions).toHaveLength(4);
      expect(manifest?.frontComponents).toHaveLength(4);
      expect(manifest?.roles).toHaveLength(2);
      expect(manifest?.objectExtensions).toHaveLength(1);
    });

    it('should include assets for front components with static imports', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      // Find the test-component which imports a PNG asset
      const testComponent = manifest.frontComponents?.find(
        (component: { name: string }) => component.name === 'test-component',
      );

      expect(testComponent).toBeDefined();
      expect(testComponent.assets).toBeDefined();
      expect(testComponent.assets).toHaveLength(1);

      const asset = testComponent.assets[0];
      expect(asset.sourceAssetPath).toBe('src/assets/test-logo.png');
      expect(asset.builtAssetPath).toMatch(/^front-components\/.*\.png$/);
      expect(asset.builtAssetChecksum).toBeDefined();
      expect(typeof asset.builtAssetChecksum).toBe('string');
    });
  });
};
