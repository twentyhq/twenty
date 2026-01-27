import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFunctionsTests = (appPath: string): void => {
  describe('functions', () => {
    it('should have built functions at root level', async () => {
      const outputDir = join(appPath, '.twenty/output');
      const files = await fs.readdir(outputDir, { recursive: true });
      const functionFiles = files
        .map((f) => f.toString())
        .filter((f) => f.includes('.function.'))
        .sort();

      expect(functionFiles).toEqual(['my.function.mjs', 'my.function.mjs.map']);
    });
  });
};
