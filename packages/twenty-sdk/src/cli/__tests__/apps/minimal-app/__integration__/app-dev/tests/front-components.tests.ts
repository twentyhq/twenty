import { readdir } from 'node:fs/promises';
import { join } from 'path';

export const defineFrontComponentsTests = (appPath: string): void => {
  describe('front-components', () => {
    it('should have built front components at root level', async () => {
      const outputDir = join(appPath, '.twenty/output');
      const files = await readdir(outputDir, { recursive: true });
      const componentFiles = files
        .map((f) => f.toString())
        .filter(
          (file) =>
            file.endsWith('.front-component.mjs') ||
            file.endsWith('.front-component.mjs.map'),
        )
        .sort();

      expect(componentFiles).toEqual([
        'my.front-component.mjs',
        'my.front-component.mjs.map',
      ]);
    });

    it('should copy front component sources to the output', async () => {
      const outputDir = join(appPath, '.twenty/output');
      const files = await readdir(outputDir, { recursive: true });

      expect(files.map((file) => file.toString())).toContain(
        'my.front-component.tsx',
      );
    });
  });
};
