import * as fs from 'fs-extra';
import { join } from 'path';

export const defineLogicFunctionsTests = (appPath: string): void => {
  describe('logicFunctions', () => {
    it('should have built logicFunctions at root level', async () => {
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
