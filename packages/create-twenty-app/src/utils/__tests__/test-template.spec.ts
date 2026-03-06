import { scaffoldIntegrationTest } from '@/utils/test-template';
import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';

describe('scaffoldIntegrationTest', () => {
  let testAppDirectory: string;
  let sourceFolderPath: string;

  beforeEach(async () => {
    testAppDirectory = join(
      tmpdir(),
      `test-twenty-app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    sourceFolderPath = join(testAppDirectory, 'src');
    await fs.ensureDir(sourceFolderPath);

    await fs.writeJson(join(testAppDirectory, 'tsconfig.json'), {
      compilerOptions: {
        paths: { 'src/*': ['./src/*'] },
      },
      exclude: ['node_modules', 'dist', '**/*.integration-test.ts'],
    });
  });

  afterEach(async () => {
    if (testAppDirectory && (await fs.pathExists(testAppDirectory))) {
      await fs.remove(testAppDirectory);
    }
  });

  describe('integration test file', () => {
    it('should create app-install.integration-test.ts with correct structure', async () => {
      await scaffoldIntegrationTest({
        appDirectory: testAppDirectory,
        sourceFolderPath,
      });

      const testPath = join(
        sourceFolderPath,
        '__tests__',
        'app-install.integration-test.ts',
      );

      expect(await fs.pathExists(testPath)).toBe(true);

      const content = await fs.readFile(testPath, 'utf8');

      expect(content).toContain(
        "import { appBuild, appUninstall } from 'twenty-sdk/cli'",
      );
      expect(content).toContain(
        "import { MetadataApiClient } from 'twenty-sdk/generated'",
      );
      expect(content).toContain(
        "import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application-config'",
      );
      expect(content).toContain('TWENTY_TEST_API_KEY');
      expect(content).toContain('assertServerIsReachable');
      expect(content).toContain('appBuild');
      expect(content).toContain('appUninstall');
      expect(content).toContain('findManyApplications');
      expect(content).toContain('APPLICATION_UNIVERSAL_IDENTIFIER');
    });
  });

  describe('setup-test file', () => {
    it('should create setup-test.ts with SDK config bootstrap', async () => {
      await scaffoldIntegrationTest({
        appDirectory: testAppDirectory,
        sourceFolderPath,
      });

      const setupTestPath = join(
        sourceFolderPath,
        '__tests__',
        'setup-test.ts',
      );

      expect(await fs.pathExists(setupTestPath)).toBe(true);

      const content = await fs.readFile(setupTestPath, 'utf8');

      expect(content).toContain('.twenty-sdk-test');
      expect(content).toContain('config.json');
      expect(content).toContain('process.env.TWENTY_API_URL');
      expect(content).toContain('process.env.TWENTY_TEST_API_KEY');
    });
  });

  describe('vitest config', () => {
    it('should create vitest.config.ts with env vars and setup file', async () => {
      await scaffoldIntegrationTest({
        appDirectory: testAppDirectory,
        sourceFolderPath,
      });

      const vitestConfigPath = join(testAppDirectory, 'vitest.config.ts');

      expect(await fs.pathExists(vitestConfigPath)).toBe(true);

      const content = await fs.readFile(vitestConfigPath, 'utf8');

      expect(content).toContain('TWENTY_TEST_API_KEY');
      expect(content).toContain('TWENTY_API_URL');
      expect(content).toContain('setup-test.ts');
      expect(content).toContain('tsconfig.spec.json');
      expect(content).toContain('integration-test.ts');
    });
  });

  describe('tsconfig.spec.json', () => {
    it('should create tsconfig.spec.json extending the base tsconfig', async () => {
      await scaffoldIntegrationTest({
        appDirectory: testAppDirectory,
        sourceFolderPath,
      });

      const tsconfigSpecPath = join(testAppDirectory, 'tsconfig.spec.json');

      expect(await fs.pathExists(tsconfigSpecPath)).toBe(true);

      const tsconfigSpec = await fs.readJson(tsconfigSpecPath);

      expect(tsconfigSpec.extends).toBe('./tsconfig.json');
      expect(tsconfigSpec.compilerOptions.composite).toBe(true);
      expect(tsconfigSpec.include).toContain('src/**/*.ts');
      expect(tsconfigSpec.exclude).not.toContain('**/*.integration-test.ts');
    });

    it('should add a reference to tsconfig.spec.json in tsconfig.json', async () => {
      await scaffoldIntegrationTest({
        appDirectory: testAppDirectory,
        sourceFolderPath,
      });

      const tsconfig = await fs.readJson(
        join(testAppDirectory, 'tsconfig.json'),
      );

      expect(tsconfig.references).toEqual([{ path: './tsconfig.spec.json' }]);
    });
  });
});
