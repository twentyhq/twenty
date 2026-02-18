import * as fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';
import { copyBaseApplicationProject } from '@/utils/app-template';
import { type ExampleOptions } from '@/types/scaffolding-options';

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

const ALL_EXAMPLES: ExampleOptions = {
  includeExampleObject: true,
  includeExampleField: true,
  includeExampleLogicFunction: true,
  includeExampleFrontComponent: true,
  includeExampleView: true,
  includeExampleNavigationMenuItem: true,
};

const NO_EXAMPLES: ExampleOptions = {
  includeExampleObject: false,
  includeExampleField: false,
  includeExampleLogicFunction: false,
  includeExampleFrontComponent: false,
  includeExampleView: false,
  includeExampleNavigationMenuItem: false,
};

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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
    });

    // Create second app
    const secondAppDir = join(testAppDirectory, 'app2');
    await fs.ensureDir(secondAppDir);
    await copyBaseApplicationProject({
      appName: 'app-two',
      appDisplayName: 'App Two',
      appDescription: 'Second app',
      appDirectory: secondAppDir,
      exampleOptions: ALL_EXAMPLES,
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
      exampleOptions: ALL_EXAMPLES,
    });

    // Create second app
    const secondAppDir = join(testAppDirectory, 'app2');
    await fs.ensureDir(secondAppDir);
    await copyBaseApplicationProject({
      appName: 'app-two',
      appDisplayName: 'App Two',
      appDescription: 'Second app',
      appDirectory: secondAppDir,
      exampleOptions: ALL_EXAMPLES,
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

  describe('scaffolding modes', () => {
    describe('exhaustive mode (all examples)', () => {
      it('should create all example files when all options are enabled', async () => {
        await copyBaseApplicationProject({
          appName: 'my-test-app',
          appDisplayName: 'My Test App',
          appDescription: 'A test application',
          appDirectory: testAppDirectory,
          exampleOptions: ALL_EXAMPLES,
        });

        const srcPath = join(testAppDirectory, 'src');

        expect(
          await fs.pathExists(join(srcPath, 'objects', 'example-object.ts')),
        ).toBe(true);
        expect(
          await fs.pathExists(join(srcPath, 'fields', 'example-field.ts')),
        ).toBe(true);
        expect(
          await fs.pathExists(
            join(srcPath, 'logic-functions', 'hello-world.ts'),
          ),
        ).toBe(true);
        expect(
          await fs.pathExists(
            join(srcPath, 'front-components', 'hello-world.tsx'),
          ),
        ).toBe(true);
        expect(
          await fs.pathExists(join(srcPath, 'views', 'example-view.ts')),
        ).toBe(true);
        expect(
          await fs.pathExists(
            join(
              srcPath,
              'navigation-menu-items',
              'example-navigation-menu-item.ts',
            ),
          ),
        ).toBe(true);
      });
    });

    describe('minimal mode (no examples)', () => {
      it('should create only core files when no examples are enabled', async () => {
        await copyBaseApplicationProject({
          appName: 'my-test-app',
          appDisplayName: 'My Test App',
          appDescription: 'A test application',
          appDirectory: testAppDirectory,
          exampleOptions: NO_EXAMPLES,
        });

        const srcPath = join(testAppDirectory, 'src');

        // Core files should exist
        expect(await fs.pathExists(join(srcPath, APPLICATION_FILE_NAME))).toBe(
          true,
        );
        expect(
          await fs.pathExists(join(srcPath, 'roles', DEFAULT_ROLE_FILE_NAME)),
        ).toBe(true);

        // Example files should not exist
        expect(
          await fs.pathExists(join(srcPath, 'objects', 'example-object.ts')),
        ).toBe(false);
        expect(
          await fs.pathExists(join(srcPath, 'fields', 'example-field.ts')),
        ).toBe(false);
        expect(
          await fs.pathExists(
            join(srcPath, 'logic-functions', 'hello-world.ts'),
          ),
        ).toBe(false);
        expect(
          await fs.pathExists(
            join(srcPath, 'front-components', 'hello-world.tsx'),
          ),
        ).toBe(false);
        expect(
          await fs.pathExists(join(srcPath, 'views', 'example-view.ts')),
        ).toBe(false);
        expect(
          await fs.pathExists(
            join(
              srcPath,
              'navigation-menu-items',
              'example-navigation-menu-item.ts',
            ),
          ),
        ).toBe(false);
      });
    });

    describe('selective examples', () => {
      it('should create only front component when only that option is enabled', async () => {
        await copyBaseApplicationProject({
          appName: 'my-test-app',
          appDisplayName: 'My Test App',
          appDescription: 'A test application',
          appDirectory: testAppDirectory,
          exampleOptions: {
            includeExampleObject: false,
            includeExampleField: false,
            includeExampleLogicFunction: false,
            includeExampleFrontComponent: true,
            includeExampleView: false,
            includeExampleNavigationMenuItem: false,
          },
        });

        const srcPath = join(testAppDirectory, 'src');

        expect(
          await fs.pathExists(
            join(srcPath, 'front-components', 'hello-world.tsx'),
          ),
        ).toBe(true);
        expect(
          await fs.pathExists(join(srcPath, 'objects', 'example-object.ts')),
        ).toBe(false);
        expect(
          await fs.pathExists(join(srcPath, 'fields', 'example-field.ts')),
        ).toBe(false);
        expect(
          await fs.pathExists(
            join(srcPath, 'logic-functions', 'hello-world.ts'),
          ),
        ).toBe(false);
      });

      it('should create only logic function when only that option is enabled', async () => {
        await copyBaseApplicationProject({
          appName: 'my-test-app',
          appDisplayName: 'My Test App',
          appDescription: 'A test application',
          appDirectory: testAppDirectory,
          exampleOptions: {
            includeExampleObject: false,
            includeExampleField: false,
            includeExampleLogicFunction: true,
            includeExampleFrontComponent: false,
            includeExampleView: false,
            includeExampleNavigationMenuItem: false,
          },
        });

        const srcPath = join(testAppDirectory, 'src');

        expect(
          await fs.pathExists(
            join(srcPath, 'logic-functions', 'hello-world.ts'),
          ),
        ).toBe(true);
        expect(
          await fs.pathExists(join(srcPath, 'objects', 'example-object.ts')),
        ).toBe(false);
      });
    });
  });

  describe('example object', () => {
    it('should create example-object.ts with defineObject and correct structure', async () => {
      await copyBaseApplicationProject({
        appName: 'my-test-app',
        appDisplayName: 'My Test App',
        appDescription: 'A test application',
        appDirectory: testAppDirectory,
        exampleOptions: ALL_EXAMPLES,
      });

      const objectPath = join(
        testAppDirectory,
        'src',
        'objects',
        'example-object.ts',
      );

      expect(await fs.pathExists(objectPath)).toBe(true);

      const content = await fs.readFile(objectPath, 'utf8');

      expect(content).toContain(
        "import { defineObject, FieldType } from 'twenty-sdk'",
      );
      expect(content).toContain('export default defineObject({');
      expect(content).toContain(
        'export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER',
      );
      expect(content).toContain('export const NAME_FIELD_UNIVERSAL_IDENTIFIER');
      expect(content).toContain("nameSingular: 'exampleItem'");
      expect(content).toContain("namePlural: 'exampleItems'");
      expect(content).toContain('FieldType.TEXT');
      expect(content).toContain(
        'labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER',
      );
    });

    it('should generate unique UUIDs for example objects across apps', async () => {
      const firstAppDir = join(testAppDirectory, 'app1');
      await fs.ensureDir(firstAppDir);
      await copyBaseApplicationProject({
        appName: 'app-one',
        appDisplayName: 'App One',
        appDescription: 'First app',
        appDirectory: firstAppDir,
        exampleOptions: ALL_EXAMPLES,
      });

      const secondAppDir = join(testAppDirectory, 'app2');
      await fs.ensureDir(secondAppDir);
      await copyBaseApplicationProject({
        appName: 'app-two',
        appDisplayName: 'App Two',
        appDescription: 'Second app',
        appDirectory: secondAppDir,
        exampleOptions: ALL_EXAMPLES,
      });

      const firstContent = await fs.readFile(
        join(firstAppDir, 'src', 'objects', 'example-object.ts'),
        'utf8',
      );
      const secondContent = await fs.readFile(
        join(secondAppDir, 'src', 'objects', 'example-object.ts'),
        'utf8',
      );

      const uuidRegex =
        /EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =\s*'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
      const firstUuid = firstContent.match(uuidRegex)?.[1];
      const secondUuid = secondContent.match(uuidRegex)?.[1];

      expect(firstUuid).toBeDefined();
      expect(secondUuid).toBeDefined();
      expect(firstUuid).not.toBe(secondUuid);
    });
  });

  describe('example field', () => {
    it('should create example-field.ts with defineField referencing the object', async () => {
      await copyBaseApplicationProject({
        appName: 'my-test-app',
        appDisplayName: 'My Test App',
        appDescription: 'A test application',
        appDirectory: testAppDirectory,
        exampleOptions: ALL_EXAMPLES,
      });

      const fieldPath = join(
        testAppDirectory,
        'src',
        'fields',
        'example-field.ts',
      );

      expect(await fs.pathExists(fieldPath)).toBe(true);

      const content = await fs.readFile(fieldPath, 'utf8');

      expect(content).toContain(
        "import { defineField, FieldType } from 'twenty-sdk'",
      );
      expect(content).toContain(
        "import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object'",
      );
      expect(content).toContain('export default defineField({');
      expect(content).toContain(
        'objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER',
      );
      expect(content).toContain('FieldType.NUMBER');
      expect(content).toContain("name: 'priority'");
    });
  });

  describe('example view', () => {
    it('should create example-view.ts with defineView referencing the object', async () => {
      await copyBaseApplicationProject({
        appName: 'my-test-app',
        appDisplayName: 'My Test App',
        appDescription: 'A test application',
        appDirectory: testAppDirectory,
        exampleOptions: ALL_EXAMPLES,
      });

      const viewPath = join(
        testAppDirectory,
        'src',
        'views',
        'example-view.ts',
      );

      expect(await fs.pathExists(viewPath)).toBe(true);

      const content = await fs.readFile(viewPath, 'utf8');

      expect(content).toContain("import { defineView } from 'twenty-sdk'");
      expect(content).toContain(
        "import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object'",
      );
      expect(content).toContain('export default defineView({');
      expect(content).toContain(
        'objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER',
      );
      expect(content).toContain("name: 'example-view'");
    });
  });

  describe('example navigation menu item', () => {
    it('should create example-navigation-menu-item.ts with defineNavigationMenuItem', async () => {
      await copyBaseApplicationProject({
        appName: 'my-test-app',
        appDisplayName: 'My Test App',
        appDescription: 'A test application',
        appDirectory: testAppDirectory,
        exampleOptions: ALL_EXAMPLES,
      });

      const navPath = join(
        testAppDirectory,
        'src',
        'navigation-menu-items',
        'example-navigation-menu-item.ts',
      );

      expect(await fs.pathExists(navPath)).toBe(true);

      const content = await fs.readFile(navPath, 'utf8');

      expect(content).toContain(
        "import { defineNavigationMenuItem } from 'twenty-sdk'",
      );
      expect(content).toContain('export default defineNavigationMenuItem({');
      expect(content).toContain("name: 'example-navigation-menu-item'");
      expect(content).toContain("icon: 'IconList'");
      expect(content).toContain('position: 0');
    });
  });
});
