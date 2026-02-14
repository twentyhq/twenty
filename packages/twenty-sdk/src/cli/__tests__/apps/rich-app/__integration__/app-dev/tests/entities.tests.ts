import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';

export const defineEntitiesTests = (appPath: string): void => {
  const outputDir = join(appPath, OUTPUT_DIR);
  describe('logicFunctions', () => {
    it('should have built logicFunctions preserving source path structure', async () => {
      const files = await fs.readdir(outputDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toEqual([
        'manifest.json',
        'package.json',
        'public',
        'public/favicon.png',
        'src',
        'src/components',
        'src/components/card.front-component.mjs',
        'src/components/card.front-component.mjs.map',
        'src/components/greeting.front-component.mjs',
        'src/components/greeting.front-component.mjs.map',
        'src/components/test.front-component.mjs',
        'src/components/test.front-component.mjs.map',
        'src/logic-functions',
        'src/logic-functions/greeting.function.mjs',
        'src/logic-functions/greeting.function.mjs.map',
        'src/logic-functions/test-function-2.function.mjs',
        'src/logic-functions/test-function-2.function.mjs.map',
        'src/logic-functions/test-function.function.mjs',
        'src/logic-functions/test-function.function.mjs.map',
        'src/root.front-component.mjs',
        'src/root.front-component.mjs.map',
        'src/root.function.mjs',
        'src/root.function.mjs.map',
        'yarn.lock',
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
