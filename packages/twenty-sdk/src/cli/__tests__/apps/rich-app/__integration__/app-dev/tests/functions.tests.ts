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
          "functions",
          "functions/greeting.function.mjs",
          "functions/greeting.function.mjs.map",
          "functions/test-function.function.mjs",
          "functions/test-function.function.mjs.map",
          "root.function.mjs",
          "root.function.mjs.map",
          "utils",
          "utils/test-function-2.util.mjs",
          "utils/test-function-2.util.mjs.map",
        ]
      `);
    });
  });
};
