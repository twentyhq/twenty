import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFunctionsTests = (appPath: string): void => {
  describe('functions', () => {
    it('should have built functions preserving source path structure', async () => {
      const functionsDir = join(appPath, '.twenty/output/functions');
      const files = await fs.readdir(functionsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toEqual([
        'src',
        'src/functions',
        'src/functions/greeting.function.mjs',
        'src/functions/greeting.function.mjs.map',
        'src/functions/test-function-2.function.mjs',
        'src/functions/test-function-2.function.mjs.map',
        'src/functions/test-function.function.mjs',
        'src/functions/test-function.function.mjs.map',
        'src/root.function.mjs',
        'src/root.function.mjs.map',
      ]);
    });

    it('should not create shared chunk files for utilities', async () => {
      const functionsDir = join(appPath, '.twenty/output/functions');
      const files = await fs.readdir(functionsDir, { recursive: true });

      // Chunk files have a hash suffix like "greeting.util-CipJsYK0.mjs"
      const chunkFiles = files
        .map((f) => f.toString())
        .filter((f) => f.endsWith('.mjs') && !f.includes('.function.mjs'));

      expect(chunkFiles).toEqual([]);
    });
  });
};
