import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFunctionsTests = (appPath: string): void => {
  describe('functions', () => {
    it('should have built functions at root level', async () => {
      const functionsDir = join(appPath, '.twenty/output/functions');
      const files = await fs.readdir(functionsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toEqual(['my.function.mjs', 'my.function.mjs.map']);
    });
  });
};
