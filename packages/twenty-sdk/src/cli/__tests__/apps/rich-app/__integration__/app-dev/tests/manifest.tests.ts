import * as fs from 'fs-extra';
import { join } from 'path';

import expectedManifest from '../manifest.expected.json';

export const defineManifestTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  describe('manifest', () => {
    it('should build manifest matching expected JSON', async () => {
      const manifest = await fs.readJson(manifestOutputPath);

      expect(manifest).not.toBeNull();

      const { sources: _sources, ...sanitizedManifest } = manifest;

      expect(sanitizedManifest).toEqual(expectedManifest);
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
