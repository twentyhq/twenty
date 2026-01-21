import * as fs from 'fs-extra';
import { join } from 'path';

export const defineFrontComponentsTests = (appPath: string): void => {
  describe('front-components', () => {
    it('should have built front components preserving source path structure', async () => {
      const frontComponentsDir = join(appPath, '.twenty/output/front-components');
      const files = await fs.readdir(frontComponentsDir, { recursive: true });
      const sortedFiles = files.map((f) => f.toString()).sort();

      expect(sortedFiles).toMatchInlineSnapshot(`
        [
          "components",
          "components/card.front-component.mjs",
          "components/card.front-component.mjs.map",
          "components/greeting.front-component.mjs",
          "components/greeting.front-component.mjs.map",
          "components/test.front-component.mjs",
          "components/test.front-component.mjs.map",
          "root.front-component.mjs",
          "root.front-component.mjs.map",
        ]
      `);
    });
  });
};
