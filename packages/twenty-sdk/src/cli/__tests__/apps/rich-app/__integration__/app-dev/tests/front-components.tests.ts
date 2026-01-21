import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFrontComponentsTests = (appPath: string): void => {
  describe('front-components', () => {
    it('should have built front components preserving source path structure', async () => {
      const frontComponentsDir = join(appPath, '.twenty/output/front-components');
      const files = await fs.readdir(frontComponentsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toEqual([
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
    });
  });
};
