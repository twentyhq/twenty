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

      // Compare serverless functions without checksums (populated dynamically)
      const manifestFunctionsWithoutChecksums = manifest.serverlessFunctions.map(
        ({ builtHandlerChecksum: _checksum, ...rest }) => rest,
      );
      const expectedFunctionsWithoutChecksums = expected.serverlessFunctions.map(
        ({ builtHandlerChecksum: _checksum, ...rest }) => rest,
      );
      expect(manifestFunctionsWithoutChecksums).toEqual(expectedFunctionsWithoutChecksums);

      // Verify checksums are populated (not null)
      for (const fn of manifest.serverlessFunctions) {
        expect(fn.builtHandlerChecksum).toBeDefined();
        expect(fn.builtHandlerChecksum).not.toBeNull();
        expect(typeof fn.builtHandlerChecksum).toBe('string');
      }

      // Compare front components without checksums (populated dynamically)
      const manifestComponentsWithoutChecksums = manifest.frontComponents?.map(
        ({ builtComponentChecksum: _checksum, ...rest }) => rest,
      );
      const expectedComponentsWithoutChecksums = expected.frontComponents?.map(
        ({ builtComponentChecksum: _checksum, ...rest }) => rest,
      );
      expect(manifestComponentsWithoutChecksums).toEqual(expectedComponentsWithoutChecksums);

      // Verify front component checksums are populated (not null)
      for (const component of manifest.frontComponents ?? []) {
        expect(component.builtComponentChecksum).toBeDefined();
        expect(component.builtComponentChecksum).not.toBeNull();
        expect(typeof component.builtComponentChecksum).toBe('string');
      }
      expect(manifest.roles).toEqual(expected.roles);
    });
  });
};
