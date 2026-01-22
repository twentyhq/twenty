import * as fs from 'fs-extra';
import { join } from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';

export const defineManifestTests = (appPath: string): void => {
  describe('manifest', () => {
    it('should have generated manifest.json', async () => {
      const manifestPath = join(appPath, '.twenty/output/manifest.json');
      const exists = await fs.pathExists(manifestPath);

      expect(exists).toBe(true);
    });

    it('should have correct manifest content', async () => {
      const manifestPath = join(appPath, '.twenty/output/manifest.json');
      const manifest: ApplicationManifest = await fs.readJSON(manifestPath);
      const expectedPath = join(appPath, '__integration__/app-dev/manifest.expected.json');
      const expected: ApplicationManifest = await fs.readJSON(expectedPath);

      expect(manifest.application).toEqual(expected.application);
      expect(manifest.objects).toEqual(expected.objects);
      expect(manifest.serverlessFunctions).toEqual(expected.serverlessFunctions);
      expect(manifest.frontComponents).toEqual(expected.frontComponents);
      expect(manifest.roles).toEqual(expected.roles);
    });
  });
};
