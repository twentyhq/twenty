import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFrontComponentsTests = (appPath: string): void => {
  describe('front-components', () => {
    it('should have built front components at root level', async () => {
      const frontComponentsDir = join(
        appPath,
        '.twenty/output/front-components',
      );
      const files = await fs.readdir(frontComponentsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toEqual([
        'my.front-component.mjs',
        'my.front-component.mjs.map',
      ]);
    });
  });
};
