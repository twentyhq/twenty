import * as fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';
import { copyBaseApplicationProject } from '@/utils/app-template';

// Mock fs-extra's copy function to skip copying base template (not available during tests)
jest.mock('fs-extra', () => {
  const actual = jest.requireActual('fs-extra');
  return {
    ...actual,
    copy: jest.fn().mockResolvedValue(undefined),
  };
});

const APPLICATION_FILE_NAME = 'application-config.ts';
const DEFAULT_ROLE_FILE_NAME = 'default-role.ts';

describe('copyBaseApplicationProject', () => {
  let testAppDirectory: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testAppDirectory = join(
      tmpdir(),
      `test-twenty-app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.ensureDir(testAppDirectory);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up temp directory after each test
    if (testAppDirectory && (await fs.pathExists(testAppDirectory))) {
      await fs.remove(testAppDirectory);
    }
  });

  it('should create the correct folder structure with src/', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    // Verify src/ folder exists
    const srcAppPath = join(testAppDirectory, 'src');
    expect(await fs.pathExists(srcAppPath)).toBe(true);

    // Verify application-config.ts exists in src/
    const appConfigPath = join(srcAppPath, APPLICATION_FILE_NAME);
    expect(await fs.pathExists(appConfigPath)).toBe(true);

    // Verify default-role.ts exists in src/
    const roleConfigPath = join(srcAppPath, 'roles', DEFAULT_ROLE_FILE_NAME);
    expect(await fs.pathExists(roleConfigPath)).toBe(true);
  });

  it('should create package.json with correct content', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const packageJsonPath = join(testAppDirectory, 'package.json');
    expect(await fs.pathExists(packageJsonPath)).toBe(true);

    const packageJson = await fs.readJson(packageJsonPath);
    expect(packageJson.name).toBe('my-test-app');
    expect(packageJson.version).toBe('0.1.0');
    expect(packageJson.dependencies['twenty-sdk']).toBe('latest');
    expect(packageJson.scripts['twenty']).toBe('twenty');
  });

  it('should create .gitignore file', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const gitignorePath = join(testAppDirectory, '.gitignore');
    expect(await fs.pathExists(gitignorePath)).toBe(true);

    const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    expect(gitignoreContent).toContain('/node_modules');
    expect(gitignoreContent).toContain('generated');
  });

  it('should create yarn.lock file', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const yarnLockPath = join(testAppDirectory, 'yarn.lock');
    expect(await fs.pathExists(yarnLockPath)).toBe(true);

    const yarnLockContent = await fs.readFile(yarnLockPath, 'utf8');
    expect(yarnLockContent).toContain('yarn lockfile v1');
  });

  it('should create application-config.ts with defineApplication and correct values', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const appConfigPath = join(testAppDirectory, 'src', APPLICATION_FILE_NAME);
    const appConfigContent = await fs.readFile(appConfigPath, 'utf8');

    // Verify it uses defineApplication
    expect(appConfigContent).toContain(
      "import { defineApplication } from 'twenty-sdk'",
    );
    expect(appConfigContent).toContain('export default defineApplication({');

    // Verify it imports the role identifier
    expect(appConfigContent).toContain(
      "import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role'",
    );

    // Verify display name and description
    expect(appConfigContent).toContain("displayName: 'My Test App'");
    expect(appConfigContent).toContain("description: 'A test application'");

    // Verify it has a universalIdentifier (UUID format)
    expect(appConfigContent).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );

    // Verify it references the role
    expect(appConfigContent).toContain(
      'defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER',
    );
  });

  it('should create default-role.ts with defineRole and correct values', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    const roleConfigPath = join(
      testAppDirectory,
      'src',
      'roles',
      DEFAULT_ROLE_FILE_NAME,
    );
    const roleConfigContent = await fs.readFile(roleConfigPath, 'utf8');

    // Verify it uses defineRole
    expect(roleConfigContent).toContain(
      "import { defineRole } from 'twenty-sdk'",
    );
    expect(roleConfigContent).toContain('export default defineRole({');

    // Verify it exports the universal identifier constant
    expect(roleConfigContent).toContain(
      'export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER',
    );

    // Verify role label includes app name
    expect(roleConfigContent).toContain(
      "label: 'My Test App default function role'",
    );

    // Verify default permissions
    expect(roleConfigContent).toContain('canReadAllObjectRecords: true');
    expect(roleConfigContent).toContain('canUpdateAllObjectRecords: true');
    expect(roleConfigContent).toContain('canSoftDeleteAllObjectRecords: true');
    expect(roleConfigContent).toContain('canDestroyAllObjectRecords: false');

    // Verify it has a universalIdentifier (UUID format)
    expect(roleConfigContent).toMatch(
      /universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER/,
    );
  });

  it('should call fs.copy to copy base application template', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: 'A test application',
      appDirectory: testAppDirectory,
    });

    // Verify fs.copy was called with correct destination
    expect(fs.copy).toHaveBeenCalledTimes(1);
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('base-application'),
      testAppDirectory,
    );
  });

  it('should handle empty description', async () => {
    await copyBaseApplicationProject({
      appName: 'my-test-app',
      appDisplayName: 'My Test App',
      appDescription: '',
      appDirectory: testAppDirectory,
    });

    const appConfigPath = join(testAppDirectory, 'src', APPLICATION_FILE_NAME);
    const appConfigContent = await fs.readFile(appConfigPath, 'utf8');

    expect(appConfigContent).toContain("description: ''");
  });

  it('should generate unique UUIDs for each application', async () => {
    // Create first app
    const firstAppDir = join(testAppDirectory, 'app1');
    await fs.ensureDir(firstAppDir);
    await copyBaseApplicationProject({
      appName: 'app-one',
      appDisplayName: 'App One',
      appDescription: 'First app',
      appDirectory: firstAppDir,
    });

    // Create second app
    const secondAppDir = join(testAppDirectory, 'app2');
    await fs.ensureDir(secondAppDir);
    await copyBaseApplicationProject({
      appName: 'app-two',
      appDisplayName: 'App Two',
      appDescription: 'Second app',
      appDirectory: secondAppDir,
    });

    // Read both app configs
    const firstAppConfig = await fs.readFile(
      join(firstAppDir, 'src', APPLICATION_FILE_NAME),
      'utf8',
    );
    const secondAppConfig = await fs.readFile(
      join(secondAppDir, 'src', APPLICATION_FILE_NAME),
      'utf8',
    );

    // Extract UUIDs using regex
    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const firstUuid = firstAppConfig.match(uuidRegex)?.[1];
    const secondUuid = secondAppConfig.match(uuidRegex)?.[1];

    expect(firstUuid).toBeDefined();
    expect(secondUuid).toBeDefined();
    expect(firstUuid).not.toBe(secondUuid);
  });

  it('should generate unique role UUIDs for each application', async () => {
    // Create first app
    const firstAppDir = join(testAppDirectory, 'app1');
    await fs.ensureDir(firstAppDir);
    await copyBaseApplicationProject({
      appName: 'app-one',
      appDisplayName: 'App One',
      appDescription: 'First app',
      appDirectory: firstAppDir,
    });

    // Create second app
    const secondAppDir = join(testAppDirectory, 'app2');
    await fs.ensureDir(secondAppDir);
    await copyBaseApplicationProject({
      appName: 'app-two',
      appDisplayName: 'App Two',
      appDescription: 'Second app',
      appDirectory: secondAppDir,
    });

    const firstRoleConfig = await fs.readFile(
      join(firstAppDir, 'src', 'roles', DEFAULT_ROLE_FILE_NAME),
      'utf8',
    );

    const secondRoleConfig = await fs.readFile(
      join(secondAppDir, 'src', 'roles', DEFAULT_ROLE_FILE_NAME),
      'utf8',
    );

    // Extract UUIDs using regex
    const uuidRegex =
      /DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =\s*'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const firstUuid = firstRoleConfig.match(uuidRegex)?.[1];
    const secondUuid = secondRoleConfig.match(uuidRegex)?.[1];

    expect(firstUuid).toBeDefined();
    expect(secondUuid).toBeDefined();
    expect(firstUuid).not.toBe(secondUuid);
  });
});
