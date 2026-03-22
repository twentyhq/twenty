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
        "import { MetadataApiClient } from 'twenty-sdk/clients'",
      );
      expect(content).toContain(
        "import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application-config'",
      );
      expect(content).toContain('appBuild');
      expect(content).toContain('appUninstall');
      expect(content).toContain('new MetadataApiClient()');
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
      expect(content).toContain('process.env.TWENTY_API_KEY');
      expect(content).toContain('assertServerIsReachable');
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

      expect(content).toContain('TWENTY_API_KEY');
      expect(content).not.toContain('TWENTY_TEST_API_KEY');
      expect(content).toContain('setup-test.ts');
      expect(content).toContain('tsconfig.spec.json');
      expect(content).toContain('integration-test.ts');
    });
  });

  describe('github workflow', () => {
    it('should create .github/workflows/ci.yml with correct structure', async () => {
      await scaffoldIntegrationTest({
        appDirectory: testAppDirectory,
        sourceFolderPath,
      });

      const workflowPath = join(
        testAppDirectory,
        '.github',
        'workflows',
        'ci.yml',
      );

      expect(await fs.pathExists(workflowPath)).toBe(true);

      const content = await fs.readFile(workflowPath, 'utf8');

      expect(content).toContain('name: CI');
      expect(content).toContain('TWENTY_VERSION: latest');
      expect(content).toContain('twenty-version: ${{ env.TWENTY_VERSION }}');
      expect(content).toContain('actions/checkout@v4');
      expect(content).toContain('spawn-twenty-docker-image@main');
      expect(content).toContain('actions/setup-node@v4');
      expect(content).toContain('yarn install --immutable');
      expect(content).toContain('yarn test');
      expect(content).toContain('TWENTY_API_URL');
      expect(content).toContain('TWENTY_TEST_API_KEY');
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
