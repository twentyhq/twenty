import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFrontComponentsTests = (appPath: string): void => {
  describe('front-components', () => {
    it('should have built front components preserving source path structure', async () => {
      const frontComponentsDir = join(appPath, '.twenty/output/front-components');
      const files = await fs.readdir(frontComponentsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      // Filter out asset files (they have hashes in their names) for deterministic comparison
      const componentFiles = sortedFiles.filter(
        (f) => !f.startsWith('assets/') && f !== 'assets',
      );

      expect(componentFiles).toEqual([
        'src',
        'src/components',
        'src/components/card.front-component.mjs',
        'src/components/card.front-component.mjs.map',
        'src/components/greeting.front-component.mjs',
        'src/components/greeting.front-component.mjs.map',
        'src/components/test.front-component.mjs',
        'src/components/test.front-component.mjs.map',
        'src/root.front-component.mjs',
        'src/root.front-component.mjs.map',
      ]);

      // Verify assets folder exists and contains the expected asset
      const assetFiles = sortedFiles.filter((f) => f.startsWith('assets/'));
      expect(assetFiles.length).toBeGreaterThanOrEqual(1);
      expect(assetFiles.some((f) => f.includes('test-logo'))).toBe(true);
    });
  });
};
