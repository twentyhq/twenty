import * as fs from 'fs-extra';
import { join } from 'path';

import expectedManifest from '../manifest.expected.json';

// Strip checksums from manifest for comparison (they are populated dynamically)
const stripChecksums = (manifest: typeof expectedManifest) => ({
  ...manifest,
  serverlessFunctions: manifest.serverlessFunctions.map(
    ({ builtHandlerChecksum: _hc, ...rest }) => rest,
  ),
  frontComponents: manifest.frontComponents?.map(
    ({ builtComponentChecksum: _cc, ...rest }) => rest,
  ),
});

export const defineManifestTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  describe('manifest', () => {
    it('should build manifest matching expected JSON', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest).not.toBeNull();

      const { sources: _sources, ...sanitizedManifest } = manifest;

      // Compare without checksums (they are dynamically generated)
      expect(stripChecksums(sanitizedManifest)).toEqual(stripChecksums(expectedManifest));

      // Verify checksums are populated
      for (const fn of manifest.serverlessFunctions) {
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
      expect(manifest?.serverlessFunctions).toHaveLength(4);
      expect(manifest?.frontComponents).toHaveLength(4);
      expect(manifest?.roles).toHaveLength(2);
      expect(manifest?.objectExtensions).toHaveLength(1);
    });
  });
};
