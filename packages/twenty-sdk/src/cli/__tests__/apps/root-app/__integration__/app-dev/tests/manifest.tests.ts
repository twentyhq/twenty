import * as fs from 'fs-extra';
import { join } from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';

import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { EXPECTED_MANIFEST } from '@/cli/__tests__/apps/root-app/__integration__/app-dev/expected-manifest';

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

      expect(manifest.application).toEqual(EXPECTED_MANIFEST.application);
      expect(manifest.entities.objects).toEqual(
        EXPECTED_MANIFEST.entities.objects,
      );

      expect(
        normalizeManifestForComparison({
          logicFunctions: manifest.entities.logicFunctions,
        }).logicFunctions,
      ).toEqual(
        normalizeManifestForComparison({
          logicFunctions: EXPECTED_MANIFEST.entities.logicFunctions,
        }).logicFunctions,
      );

      for (const fn of manifest.entities.logicFunctions) {
        expect(fn.builtHandlerChecksum).toBeDefined();
        expect(fn.builtHandlerChecksum).not.toBeNull();
        expect(typeof fn.builtHandlerChecksum).toBe('string');
      }

      expect(
        normalizeManifestForComparison({
          frontComponents: manifest.entities.frontComponents,
        }).frontComponents,
      ).toEqual(
        normalizeManifestForComparison({
          frontComponents: EXPECTED_MANIFEST.entities.frontComponents,
        }).frontComponents,
      );

      for (const component of manifest.entities.frontComponents ?? []) {
        expect(component.builtComponentChecksum).toBeDefined();
        expect(component.builtComponentChecksum).not.toBeNull();
        expect(typeof component.builtComponentChecksum).toBe('string');
      }
      expect(manifest.entities.roles).toEqual(EXPECTED_MANIFEST.entities.roles);
    });
  });
};
