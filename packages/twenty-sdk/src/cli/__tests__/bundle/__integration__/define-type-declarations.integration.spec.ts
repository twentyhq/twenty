import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../../../..');
const defineDeclarationsPath = resolve(packageRoot, 'dist/define/index.d.ts');
const isBundleBuilt = existsSync(defineDeclarationsPath);

describe('define type declarations', () => {
  const runOrSkip = isBundleBuilt || process.env.CI ? it : it.skip;

  runOrSkip('type defineWorkflow without requiring apps to install zod', () => {
    if (!isBundleBuilt) {
      throw new Error(
        `Expected the built declarations at ${defineDeclarationsPath}. Run \`npx nx build twenty-sdk\` before this test.`,
      );
    }

    const defineDeclarations = readFileSync(defineDeclarationsPath, 'utf8');

    expect(defineDeclarations).toContain('declare const defineWorkflow');
    expect(defineDeclarations).not.toMatch(/from ['"]zod(\/[^'"]*)?['"]/);
  });
});
