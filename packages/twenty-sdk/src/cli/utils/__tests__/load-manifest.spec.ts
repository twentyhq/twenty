import { ensureDirSync, writeFileSync, removeSync } from 'fs-extra';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { loadManifest } from '@/cli/utils/load-manifest';
import { type ApplicationConfig } from '@/application';

const write = (root: string, file: string, content: string) => {
  const abs = join(root, file);
  ensureDirSync(resolve(abs, '..'));
  writeFileSync(abs, content, 'utf8');
};

const tsLibMock = `declare module 'tslib' {
   export const __decorate: any;
   export const __metadata: any;
   export const __param: any;
   export const __awaiter: any;
   export const __read: any;
   export const __spread: any;
   export const __spreadArray: any;
   export const __assign: any;
 }`;

const twentySdkTypesMock = `
declare module 'twenty-sdk' {
  export type SyncableEntityOptions = { universalIdentifier: string };

  type ApplicationVariable = SyncableEntityOptions & {
    value?: string;
    description?: string;
    isSecret?: boolean;
  };

  export type ApplicationConfig = SyncableEntityOptions & {
    displayName?: string;
    description?: string;
    icon?: string;
    applicationVariables?: Record<string, ApplicationVariable>;
    functionRoleUniversalIdentifier?: string;
  };
  
  export type RoleConfig = SyncableEntityOptions & {
    label: string;
    description?: string;
    icon?: string;
    canReadAllObjectRecords?: boolean;
    canUpdateAllObjectRecords?: boolean;
    canSoftDeleteAllObjectRecords?: boolean;
    canDestroyAllObjectRecords?: boolean;
    objectPermissions?: any[];
    fieldPermissions?: any[];
    permissionFlags?: any[];
  };

  export enum PermissionFlag {
    API_KEYS_AND_WEBHOOKS = 'API_KEYS_AND_WEBHOOKS',
    WORKSPACE = 'WORKSPACE',
    WORKSPACE_MEMBERS = 'WORKSPACE_MEMBERS',
    ROLES = 'ROLES',
    DATA_MODEL = 'DATA_MODEL',
    SECURITY = 'SECURITY',
    WORKFLOWS = 'WORKFLOWS',
    IMPERSONATE = 'IMPERSONATE',
    SSO_BYPASS = 'SSO_BYPASS',
    APPLICATIONS = 'APPLICATIONS',
    LAYOUTS = 'LAYOUTS',
    BILLING = 'BILLING',
    AI_SETTINGS = 'AI_SETTINGS',

    // Tool permissions
    AI = 'AI',
    VIEWS = 'VIEWS',
    UPLOAD_FILE = 'UPLOAD_FILE',
    DOWNLOAD_FILE = 'DOWNLOAD_FILE',
    SEND_EMAIL_TOOL = 'SEND_EMAIL_TOOL',
    HTTP_REQUEST_TOOL = 'HTTP_REQUEST_TOOL',
    IMPORT_CSV = 'IMPORT_CSV',
    EXPORT_CSV = 'EXPORT_CSV',
    CONNECTED_ACCOUNTS = 'CONNECTED_ACCOUNTS',
    PROFILE_INFORMATION = 'PROFILE_INFORMATION',
  }



  type RouteTrigger = {
    type: 'route';
    path: string;
    httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    isAuthRequired: boolean;
  };

  type CronTrigger = {
    type: 'cron';
    pattern: string;
  };

  type DatabaseEventTrigger = {
    type: 'databaseEvent';
    eventName: string;
  };

  type ServerlessFunctionTrigger = SyncableEntityOptions &
    (RouteTrigger | CronTrigger | DatabaseEventTrigger);

  export type FunctionConfig = SyncableEntityOptions & {
    name?: string;
    description?: string;
    timeoutSeconds?: number;
    triggers?: ServerlessFunctionTrigger[];
  };

  type ObjectMetadataOptions = SyncableEntityOptions & {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
    description?: string;
    icon?: string;
  };

  export const Object = (_: ObjectMetadataOptions): ClassDecorator => {
    return () => {};
  };

  export class BaseObjectMetadata {}

  export enum FieldType {
    TEXT = 'TEXT',
    FULL_NAME = 'FULL_NAME',
    ADDRESS = 'ADDRESS',
    SELECT = 'SELECT',
    DATE_TIME = 'DATE_TIME',
  }

  export const Field: (_: any) => PropertyDecorator;
}
`;

const defaultRoleMock = `
import { PermissionFlag, type RoleConfig } from 'twenty-sdk';

export const functionRole: RoleConfig = {
  universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
  label: 'hello-world-role',
  description: 'A role to define app permissions',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    {
      objectNameSingular: 'postCard',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectNameSingular: 'postCard',
      fieldName: 'content',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS],
}

`;

const serverlessFunctionMock = `
import { type FunctionConfig } from 'twenty-sdk';

export const main = async (params: any): Promise<any> => {
  return {};
}

export const config: FunctionConfig = {
  universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
  name: 'hello',
  timeoutSeconds: 2,
  triggers: [
    {
      universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
      type: 'route',
      path: '/post-card/create',
      httpMethod: 'GET',
      isAuthRequired: false
    },
    {
      universalIdentifier: 'dd802808-0695-49e1-98c9-d5c9e2704ce2',
      type: 'cron',
      pattern: '0 0 1 1 *', // Every year 1st of January
    },
    {
      universalIdentifier: '203f1df3-4a82-4d06-a001-b8cf22a31156',
      type: 'databaseEvent',
      eventName: 'person.created'
    }
  ]
};`;

const objectMock = `import {
  Object,
  Field,
  FieldType
} from 'twenty-sdk';

enum PostCardStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

@Object({
  universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
  nameSingular: 'postCard',
  namePlural: 'postCards',
  labelSingular: 'Post card',
  labelPlural: 'Post cards',
  description: ' A post card object',
  icon: 'IconMail',
})
export class PostCard {
  @Field({
    universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
    type: FieldType.TEXT,
    label: 'Content',
    description: "Postcard's content",
  })
  content: string;

  @Field({
    universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
    type: FieldType.FULL_NAME,
    label: 'Recipient name',
  })
  recipientName: string;

  @Field({
    universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
    type: FieldType.ADDRESS,
    label: 'Recipient address',
  })
  recipientAddress: string;

  @Field({
    universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
    type: FieldType.SELECT,
    label: 'Status',
    defaultValue: \`'\${PostCardStatus.DRAFT}'\`,
    options: [
      {
        value: PostCardStatus.DRAFT,
        label: 'Draft',
        position: 0,
        color: 'gray',
      },
      {
        value: PostCardStatus.SENT,
        label: 'Sent',
        position: 1,
        color: 'orange',
      },
      {
        value: PostCardStatus.DELIVERED,
        label: 'Delivered',
        position: 2,
        color: 'green',
      },
      {
        value: PostCardStatus.RETURNED,
        label: 'Returned',
        position: 3,
        color: 'orange',
      },
    ],
  })
  status: 'draft' | 'sent' | 'delivered' | 'returned';

  @Field({
    universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
    type: FieldType.DATE_TIME,
    label: 'Delivered at',
    isNullable: true,
    defaultValue: null,
  })
  deliveredAt?: Date;
}
`;

const packageJsonMock = {
  name: 'my-app',
  version: '0.0.1',
  license: 'MIT',
  engines: {
    node: '^24.5.0',
    npm: 'please-use-yarn',
    yarn: '>=4.0.2',
  },
  packageManager: 'yarn@4.9.2',
  scripts: {
    'create-entity': 'twenty app add',
    dev: 'twenty app dev',
    generate: 'twenty app generate',
    sync: 'twenty app sync',
    uninstall: 'twenty app uninstall',
    auth: 'twenty auth login',
  },
  dependencies: {
    'twenty-sdk': '0.1.0',
  },
  devDependencies: {
    '@types/node': '^24.7.2',
    typescript: '^5.9.3',
  },
};

const tsConfigJsonMock = {
  compileOnSave: false,
  compilerOptions: {
    sourceMap: true,
    declaration: true,
    outDir: './dist',
    rootDir: '.',
    moduleResolution: 'node',
    allowSyntheticDefaultImports: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    importHelpers: true,
    allowUnreachableCode: false,
    strictNullChecks: true,
    alwaysStrict: true,
    noImplicitAny: true,
    strictBindCallApply: false,
    target: 'es2018',
    module: 'esnext',
    lib: ['es2020', 'dom'],
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    resolveJsonModule: true,
  },

  exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
};

const yarnLockMock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1
`;

const applicationMockConfig: ApplicationConfig = {
  universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
  displayName: 'My App',
  description: 'My app description',
  icon: 'IconWorld',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: '3a327392-3a0f-4605-9223-0633f063eaf6',
      description: 'Twenty API Key',
      isSecret: true,
    },
    TWENTY_API_URL: {
      universalIdentifier: 'aa7210a6-75b0-46ca-bcbe-09a5b42a76ec',
      description: 'Twenty API Url',
      isSecret: false,
    },
  },
  functionRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
};

const applicationConfigMock = `import { type ApplicationConfig } from 'twenty-sdk';

const config: ApplicationConfig = ${JSON.stringify(applicationMockConfig)};

export default config;
`;

describe('loadManifest (integration)', () => {
  const appDirectory = join(tmpdir(), 'test-app');

  beforeEach(async () => {
    await ensureDirSync(appDirectory);

    write(appDirectory, 'yarn.lock', yarnLockMock);

    write(appDirectory, 'application.config.ts', applicationConfigMock);

    write(
      appDirectory,
      'tsconfig.json',
      JSON.stringify(tsConfigJsonMock, null, 2),
    );

    write(
      appDirectory,
      'package.json',
      JSON.stringify(packageJsonMock, null, 2),
    );

    write(appDirectory, 'src/Account.ts', objectMock);

    write(appDirectory, 'src/hello.ts', serverlessFunctionMock);

    write(appDirectory, 'src/defaultRole.ts', defaultRoleMock);

    write(
      appDirectory,
      'src/types/twenty-sdk-application.d.ts',
      twentySdkTypesMock,
    );

    write(
      appDirectory,
      'src/types/tslib.d.ts',
      // minimal + future-proof
      tsLibMock,
    );
  });

  afterEach(() => {
    removeSync(appDirectory);
  });

  it('builds a full manifest for a valid workspace', async () => {
    const { packageJson, yarnLock, manifest } =
      await loadManifest(appDirectory);

    expect(packageJson.name).toBe('my-app');
    expect(packageJson.version).toBe('0.0.1');
    expect(packageJson.license).toBe('MIT');
    expect(yarnLock).toContain(
      '# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.',
    );

    // application
    expect(manifest.application).toEqual(applicationMockConfig);

    expect(manifest.objects.length).toBe(1);

    for (const object of manifest.objects) {
      const { universalIdentifier: _, fields, ...otherInfo } = object;
      expect(otherInfo).toEqual({
        description: ' A post card object',
        icon: 'IconMail',
        labelPlural: 'Post cards',
        labelSingular: 'Post card',
        namePlural: 'postCards',
        nameSingular: 'postCard',
      });

      expect(Array.isArray(fields)).toBe(true);

      expect(fields).toEqual([
        {
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          type: 'TEXT',
          label: 'Content',
          description: "Postcard's content",
          name: 'content',
        },
        {
          universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
          type: 'FULL_NAME',
          label: 'Recipient name',
          name: 'recipientName',
        },
        {
          universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
          type: 'ADDRESS',
          label: 'Recipient address',
          name: 'recipientAddress',
        },
        {
          universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
          type: 'SELECT',
          label: 'Status',
          defaultValue: "'DRAFT'",
          options: [
            { value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
            { value: 'SENT', label: 'Sent', position: 1, color: 'orange' },
            {
              value: 'DELIVERED',
              label: 'Delivered',
              position: 2,
              color: 'green',
            },
            {
              value: 'RETURNED',
              label: 'Returned',
              position: 3,
              color: 'orange',
            },
          ],
          name: 'status',
        },
        {
          universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
          type: 'DATE_TIME',
          label: 'Delivered at',
          isNullable: true,
          defaultValue: null,
          name: 'deliveredAt',
        },
      ]);
    }

    // serverless functions
    for (const serverlessFunction of manifest.serverlessFunctions) {
      const {
        universalIdentifier: _,
        handlerPath: __,
        triggers,
        ...otherInfo
      } = serverlessFunction;

      expect(otherInfo).toEqual({
        handlerName: 'main',
        name: 'hello',
        timeoutSeconds: 2,
      });

      for (const trigger of triggers) {
        const { universalIdentifier: _, ...otherInfo } = trigger;
        switch (trigger.type) {
          case 'route':
            expect(otherInfo).toEqual({
              isAuthRequired: false,
              httpMethod: 'GET',
              path: '/post-card/create',
              type: 'route',
            });
            break;
          case 'cron':
            expect(otherInfo).toEqual({
              pattern: '0 0 1 1 *',
              type: 'cron',
            });
            break;
          case 'databaseEvent':
            expect(otherInfo).toEqual({
              eventName: 'person.created',
              type: 'databaseEvent',
            });
            break;
        }
      }
    }

    //Role
    expect(manifest.roles).toHaveLength(1);

    for (const role of manifest.roles ?? []) {
      const {
        universalIdentifier: _,
        objectPermissions,
        fieldPermissions,
        permissionFlags,
        ...otherInfo
      } = role;
      expect(otherInfo).toEqual({
        label: 'hello-world-role',
        description: 'A role to define app permissions',
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      });

      expect(Array.isArray(objectPermissions)).toBe(true);
      expect(Array.isArray(fieldPermissions)).toBe(true);
      expect(Array.isArray(permissionFlags)).toBe(true);
    }
  });

  it('should not define serverless for util file', async () => {
    write(
      appDirectory,
      'src/utils/format.ts',
      `
export const format = async (params: any): Promise<any> => {
  return {};
}
`,
    );

    const { manifest } = await loadManifest(appDirectory);
    expect(manifest.serverlessFunctions.length).toBe(1);
  });

  it('manifest should contains typescript sources', async () => {
    const { manifest } = await loadManifest(appDirectory);
    // the method is already exercised in loadManifest; just assert again:
    expect(Object.keys(manifest.sources)).toEqual([
      'application.config.ts',
      'src',
    ]);
    expect(Object.keys(manifest.sources['src'])).toEqual([
      'Account.ts',
      'defaultRole.ts',
      'hello.ts',
    ]);
  });

  it('manifest should contains typescript sources', async () => {
    const { shouldGenerate } = await loadManifest(appDirectory);
    expect(shouldGenerate).toBe(false);
  });
});
