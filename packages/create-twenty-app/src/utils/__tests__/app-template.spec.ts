import { copyBaseApplicationProject } from '@/utils/app-template';
import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import createTwentyAppPackageJson from 'package.json';
import { join } from 'path';

jest.mock('fs-extra', () => {
  const actual = jest.requireActual('fs-extra');
  return {
    ...actual,
    copy: jest.fn().mockResolvedValue(undefined),
  };
});

const UNIVERSAL_IDENTIFIERS_PATH = join(
  'src',
  'constants',
  'universal-identifiers.ts',
);

// Template content matching template/src/constants/universal-identifiers.ts
const TEMPLATE_UNIVERSAL_IDENTIFIERS = `export const APP_DISPLAY_NAME = 'DISPLAY-NAME-TO-BE-GENERATED';
export const APP_DESCRIPTION = 'DESCRIPTION-TO-BE-GENERATED';
export const APPLICATION_UNIVERSAL_IDENTIFIER = 'UUID-TO-BE-GENERATED';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER = 'UUID-TO-BE-GENERATED';
`;

// Template package.json matching template/package.json
const TEMPLATE_PACKAGE_JSON = {
  name: 'template-app',
  version: '0.1.0',
  license: 'MIT',
  scripts: { twenty: 'twenty' },
  dependencies: {
    'twenty-sdk': '0.0.0',
    'twenty-client-sdk': '0.0.0',
  },
};

describe('copyBaseApplicationProject', () => {
  let testAppDirectory: string;

  beforeEach(async () => {
    testAppDirectory = join(
      tmpdir(),
      `test-twenty-app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.ensureDir(testAppDirectory);

    // Seed the files that generateUniversalIdentifiers and updatePackageJson
    // expect to find (since fs.copy is mocked and won't actually create them)
    await fs.ensureDir(join(testAppDirectory, 'src', 'constants'));
    await fs.writeFile(
      join(testAppDirectory, UNIVERSAL_IDENTIFIERS_PATH),
      TEMPLATE_UNIVERSAL_IDENTIFIERS,
    );
    await fs.writeJson(
      join(testAppDirectory, 'package.json'),
      TEMPLATE_PACKAGE_JSON,
    );

    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (testAppDirectory && (await fs.pathExists(testAppDirectory))) {
      await fs.remove(testAppDirectory);
    }
  });

  it('should call fs.copy to copy base application template', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    expect(fs.copy).toHaveBeenCalledTimes(1);
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('template'),
      testAppDirectory,
    );
  });

  it('should replace placeholders in universal-identifiers.ts with real values', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const content = await fs.readFile(
      join(testAppDirectory, UNIVERSAL_IDENTIFIERS_PATH),
      'utf8',
    );

    expect(content).toContain("APP_DISPLAY_NAME = 'My Test App'");
    expect(content).toContain("APP_DESCRIPTION = 'A test application'");
    expect(content).not.toContain('DISPLAY-NAME-TO-BE-GENERATED');
    expect(content).not.toContain('DESCRIPTION-TO-BE-GENERATED');
    expect(content).not.toContain('UUID-TO-BE-GENERATED');

    // Both UUIDs should be valid v4 format
    const uuidMatches = content.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    );
    expect(uuidMatches).toHaveLength(2);
  });

  it('should generate different UUIDs for each identifier', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const content = await fs.readFile(
      join(testAppDirectory, UNIVERSAL_IDENTIFIERS_PATH),
      'utf8',
    );

    const uuidMatches = content.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    );
    expect(uuidMatches).toHaveLength(2);
    expect(uuidMatches![0]).not.toBe(uuidMatches![1]);
  });

  it('should update package.json with app name and SDK versions', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const packageJson = await fs.readJson(
      join(testAppDirectory, 'package.json'),
    );
    expect(packageJson.name).toBe('my-test-app');
    expect(packageJson.dependencies['twenty-sdk']).toBe(
      createTwentyAppPackageJson.version,
    );
    expect(packageJson.dependencies['twenty-client-sdk']).toBe(
      createTwentyAppPackageJson.version,
    );
  });

  it('should handle empty description', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: '',
      appDirectory: testAppDirectory,
    });

    const content = await fs.readFile(
      join(testAppDirectory, UNIVERSAL_IDENTIFIERS_PATH),
      'utf8',
    );

    expect(content).toContain("APP_DESCRIPTION = ''");
  });

  it('should generate unique UUIDs across different scaffolds', async () => {
    const firstAppDir = join(testAppDirectory, 'app1');
    await fs.ensureDir(join(firstAppDir, 'src', 'constants'));
    await fs.writeFile(
      join(firstAppDir, UNIVERSAL_IDENTIFIERS_PATH),
      TEMPLATE_UNIVERSAL_IDENTIFIERS,
    );
    await fs.writeJson(
      join(firstAppDir, 'package.json'),
      TEMPLATE_PACKAGE_JSON,
    );
    await copyBaseApplicationProject({
      appName: 'app-one',
      appDisplayName: 'App One',
      appDescription: 'First app',
      appDirectory: firstAppDir,
    });

    const secondAppDir = join(testAppDirectory, 'app2');
    await fs.ensureDir(join(secondAppDir, 'src', 'constants'));
    await fs.writeFile(
      join(secondAppDir, UNIVERSAL_IDENTIFIERS_PATH),
      TEMPLATE_UNIVERSAL_IDENTIFIERS,
    );
    await fs.writeJson(
      join(secondAppDir, 'package.json'),
      TEMPLATE_PACKAGE_JSON,
    );
    await copyBaseApplicationProject({
      appName: 'app-two',
      appDisplayName: 'App Two',
      appDescription: 'Second app',
      appDirectory: secondAppDir,
    });

    const firstConstants = await fs.readFile(
      join(firstAppDir, UNIVERSAL_IDENTIFIERS_PATH),
      'utf8',
    );
    const secondConstants = await fs.readFile(
      join(secondAppDir, UNIVERSAL_IDENTIFIERS_PATH),
      'utf8',
    );

    const uuidRegex =
      /APPLICATION_UNIVERSAL_IDENTIFIER = '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const firstUuid = firstConstants.match(uuidRegex)?.[1];
    const secondUuid = secondConstants.match(uuidRegex)?.[1];

    expect(firstUuid).toBeDefined();
    expect(secondUuid).toBeDefined();
    expect(firstUuid).not.toBe(secondUuid);
  });
});
