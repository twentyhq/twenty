import * as fs from 'fs-extra';
import { join } from 'path';

const SEED_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ1c2VySWQiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtNDYzZi00MzViLTgyOGMtMTA3ZTAwN2EyNzExIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWU3Yy00M2Q5LWE1ZGItNjg1YjUwNjlkODE2IiwidHlwZSI6IkFDQ0VTUyIsImF1dGhQcm92aWRlciI6InBhc3N3b3JkIiwiaWF0IjoxNzUxMjgxNzA0LCJleHAiOjIwNjY4NTc3MDR9.HMGqCsVlOAPVUBhKSGlD1X86VoHKt4LIUtET3CGIdik';

export const scaffoldIntegrationTest = async ({
  appDirectory,
  sourceFolderPath,
}: {
  appDirectory: string;
  sourceFolderPath: string;
}) => {
  await createIntegrationTest({
    appDirectory: sourceFolderPath,
    fileFolder: '__tests__',
    fileName: 'app-install.integration-test.ts',
  });

  await createSetupTest({
    appDirectory: sourceFolderPath,
    fileFolder: '__tests__',
    fileName: 'setup-test.ts',
  });

  await createVitestConfig(appDirectory);
  await createTsconfigSpec(appDirectory);
};

const createVitestConfig = async (appDirectory: string) => {
  const content = `import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    include: ['src/**/*.integration-test.ts'],
    setupFiles: ['src/__tests__/setup-test.ts'],
    env: {
      TWENTY_API_URL: 'http://localhost:3000',
      TWENTY_TEST_API_KEY:
        '${SEED_API_KEY}',
    },
  },
});
`;

  await fs.writeFile(join(appDirectory, 'vitest.config.ts'), content);
};

const createTsconfigSpec = async (appDirectory: string) => {
  const tsconfigSpec = {
    extends: './tsconfig.json',
    compilerOptions: {
      composite: true,
      types: ['vitest/globals'],
    },
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['node_modules', 'dist'],
  };

  await fs.writeFile(
    join(appDirectory, 'tsconfig.spec.json'),
    JSON.stringify(tsconfigSpec, null, 2),
  );

  const tsconfigPath = join(appDirectory, 'tsconfig.json');
  const tsconfig = await fs.readJson(tsconfigPath);

  tsconfig.references = [{ path: './tsconfig.spec.json' }];

  await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
};

const createSetupTest = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const content = `import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { beforeAll } from 'vitest';

const TEST_CONFIG_DIR = path.join(os.tmpdir(), '.twenty-sdk-test');

beforeAll(() => {
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });

  const configFile = {
    profiles: {
      default: {
        apiUrl: process.env.TWENTY_API_URL,
        apiKey: process.env.TWENTY_TEST_API_KEY,
      },
    },
  };

  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, 'config.json'),
    JSON.stringify(configFile, null, 2),
  );
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createIntegrationTest = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const content = `import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application-config';
import { appBuild, appUninstall } from 'twenty-sdk/cli';
import { MetadataApiClient } from 'twenty-sdk/generated';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const APP_PATH = process.cwd();
const TWENTY_API_URL = process.env.TWENTY_API_URL ?? 'http://localhost:3000';

const assertServerIsReachable = async () => {
  let response: Response;

  try {
    response = await fetch(\`\${TWENTY_API_URL}/healthz\`);
  } catch {
    throw new Error(
      \`Twenty server is not reachable at \${TWENTY_API_URL}. \` +
        'Make sure the server is running before executing integration tests.',
    );
  }

  if (!response.ok) {
    throw new Error(\`Server at \${TWENTY_API_URL} returned \${response.status}\`);
  }
};

describe('App installation', () => {
  let appInstalled = false;

  beforeAll(async () => {
    await assertServerIsReachable();

    const buildResult = await appBuild({
      appPath: APP_PATH,
      onProgress: (message: string) => console.log(\`[build] \${message}\`),
    });

    if (!buildResult.success) {
      throw new Error(
        \`App build failed: \${buildResult.error?.message ?? 'Unknown error'}\`,
      );
    }

    appInstalled = true;
  });

  afterAll(async () => {
    if (!appInstalled) {
      return;
    }

    const uninstallResult = await appUninstall({ appPath: APP_PATH });

    if (!uninstallResult.success) {
      console.warn(
        \`App uninstall failed: \${uninstallResult.error?.message ?? 'Unknown error'}\`,
      );
    }
  });

  it('should find the installed app in the applications list', async () => {
    const apiKey = process.env.TWENTY_TEST_API_KEY;

    if (!apiKey) {
      throw new Error(
        'No API key found. Set TWENTY_TEST_API_KEY in your vitest config env.',
      );
    }

    const metadataClient = new MetadataApiClient({
      url: \`\${TWENTY_API_URL}/metadata\`,
      headers: {
        Authorization: \`Bearer \${apiKey}\`,
      },
    });

    const result = await metadataClient.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const installedApp = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier ===
        APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(installedApp).toBeDefined();
  });
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};
