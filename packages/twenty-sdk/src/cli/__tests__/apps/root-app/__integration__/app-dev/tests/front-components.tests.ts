import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFrontComponentsTests = (appPath: string): void => {
  describe('front-components', () => {
    it('should have built front components at root level', async () => {
      const outputDir = join(appPath, '.twenty/output');
      const files = await fs.readdir(outputDir, { recursive: true });
      const componentFiles = files
        .map((f) => f.toString())
        .filter((f) => f.includes('.front-component.'))
        .sort();

      expect(componentFiles).toEqual([
        'my.front-component.mjs',
        'my.front-component.mjs.map',
      ]);
    });
  });
};
