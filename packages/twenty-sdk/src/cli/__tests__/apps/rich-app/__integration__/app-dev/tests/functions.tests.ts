import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFunctionsTests = (appPath: string): void => {
  describe('functions', () => {
    it('should have built functions preserving source path structure', async () => {
      const functionsDir = join(appPath, '.twenty/output/functions');
      const files = await fs.readdir(functionsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toMatchInlineSnapshot(`
        [
          "src",
          "src/functions",
          "src/functions/greeting.function.mjs",
          "src/functions/greeting.function.mjs.map",
          "src/functions/test-function.function.mjs",
          "src/functions/test-function.function.mjs.map",
          "src/root.function.mjs",
          "src/root.function.mjs.map",
          "src/utils",
          "src/utils/test-function-2.util.mjs",
          "src/utils/test-function-2.util.mjs.map",
        ]
      `);
    });
  });
};
