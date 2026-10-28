import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../../..');
const defineDeclarationsPath = resolve(packageRoot, 'dist/define/index.d.ts');
const isBundleBuilt = existsSync(defineDeclarationsPath);

const readDefineDeclarations = () => {
  if (!isBundleBuilt) {
    throw new Error(
      `Expected the built declarations at ${defineDeclarationsPath}. Run \`npx nx build twenty-sdk\` before this test.`,
    );
  }

  return readFileSync(defineDeclarationsPath, 'utf8');
};

describe('define type declarations', () => {
  const runOrSkip = isBundleBuilt || process.env.CI ? it : it.skip;

  runOrSkip('type defineWorkflow without requiring apps to install zod', () => {
    const defineDeclarations = readDefineDeclarations();

    expect(defineDeclarations).toContain('declare const defineWorkflow');
    expect(defineDeclarations).not.toMatch(/from ['"]zod(\/[^'"]*)?['"]/);
  });

  runOrSkip(
    'keep deprecated permission flag names marked as deprecated',
    () => {
      const defineDeclarations = readDefineDeclarations();

      expect(defineDeclarations).toMatch(
        /@deprecated Use `SystemPermissionFlag\.USER_APPS` instead\.\s*\*\/\s*readonly CONNECTED_ACCOUNTS:/,
      );
      expect(defineDeclarations).toMatch(
        /@deprecated Use `SystemPermissionFlag\.WORKSPACE_APPS` instead\.\s*\*\/\s*readonly APPLICATIONS:/,
      );
    },
  );
});
