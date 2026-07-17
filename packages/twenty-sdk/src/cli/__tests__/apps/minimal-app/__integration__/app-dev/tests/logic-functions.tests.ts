import { readdir } from 'node:fs/promises';
import { join } from 'path';

export const defineLogicFunctionsTests = (appPath: string): void => {
  describe('logicFunctions', () => {
    it('should have built logicFunctions at root level', async () => {
      const outputDir = join(appPath, '.twenty/output');
      const files = await readdir(outputDir, { recursive: true });
      const functionFiles = files
        .map((f) => f.toString())
        .filter(
          (file) =>
            file.endsWith('.function.mjs') ||
            file.endsWith('.function.mjs.map'),
        )
        .sort();

      expect(functionFiles).toEqual(['my.function.mjs', 'my.function.mjs.map']);
    });

    it('should copy logic function sources to the output', async () => {
      const outputDir = join(appPath, '.twenty/output');
      const files = await readdir(outputDir, { recursive: true });

      expect(files.map((file) => file.toString())).toContain('my.function.ts');
    });
  });
};
