import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';

export const defineEntitiesTests = (appPath: string): void => {
  const outputDir = join(appPath, OUTPUT_DIR);
  describe('functions', () => {
    it('should have built functions preserving source path structure', async () => {
      const files = await fs.readdir(outputDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toEqual([
        'manifest.json',
        'src',
        'src/components',
        'src/components/card.front-component.mjs',
        'src/components/card.front-component.mjs.map',
        'src/components/greeting.front-component.mjs',
        'src/components/greeting.front-component.mjs.map',
        'src/components/test.front-component.mjs',
        'src/components/test.front-component.mjs.map',
        'src/functions',
        'src/functions/greeting.function.mjs',
        'src/functions/greeting.function.mjs.map',
        'src/functions/test-function-2.function.mjs',
        'src/functions/test-function-2.function.mjs.map',
        'src/functions/test-function.function.mjs',
        'src/functions/test-function.function.mjs.map',
        'src/root.front-component.mjs',
        'src/root.front-component.mjs.map',
        'src/root.function.mjs',
        'src/root.function.mjs.map',
      ]);
    });

    it('should not create shared chunk files for utilities', async () => {
      const files = await fs.readdir(outputDir, { recursive: true });

      // Chunk files have a hash suffix like "greeting.util-CipJsYK0.mjs"
      const chunkFiles = files
        .map((f) => f.toString())
        .filter((f) => f.endsWith('.mjs') && !f.includes('.function.mjs'))
        .filter(
          (f) => f.endsWith('.mjs') && !f.includes('.front-component.mjs'),
        );

      expect(chunkFiles).toEqual([]);
    });
  });
};
