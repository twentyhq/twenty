import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { ensureDirSync, writeFileSync, removeSync } from 'fs-extra';
import { copyBaseApplicationProject } from '../app-template';
import { loadManifest } from '../load-manifest';

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
declare module 'twenty-sdk/application' {
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
  };

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
  
  export type ServerlessFunctionConfig = SyncableEntityOptions & {
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
  
  export const ObjectMetadata = (_: ObjectMetadataOptions): ClassDecorator => {
    return () => {};
  };

  export class BaseObjectMetadata {}

  export enum FieldMetadataType {
    TEXT = 'TEXT',
    FULL_NAME = 'FULL_NAME',
    ADDRESS = 'ADDRESS',
    SELECT = 'SELECT',
    DATE_TIME = 'DATE_TIME',
  }

  export const FieldMetadata: (_: any) => PropertyDecorator;
}
`;

const serverlessFunctionMock = `
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: any): Promise<any> => {
  return {};
}

export const config: ServerlessFunctionConfig = {
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
  ObjectMetadata,
  BaseObjectMetadata,
  FieldMetadata,
  FieldMetadataType
} from 'twenty-sdk/application';

enum PostCardStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

@ObjectMetadata({
  universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
  nameSingular: 'postCard',
  namePlural: 'postCards',
  labelSingular: 'Post card',
  labelPlural: 'Post cards',
  description: ' A post card object',
  icon: 'IconMail',
})
export class PostCard extends BaseObjectMetadata {
  @FieldMetadata({
    universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
    type: FieldMetadataType.TEXT,
    label: 'Content',
    description: "Postcard's content",
  })
  content: string;

  @FieldMetadata({
    universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
    type: FieldMetadataType.FULL_NAME,
    label: 'Recipient name',
  })
  recipientName: string;

  @FieldMetadata({
    universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
    type: FieldMetadataType.ADDRESS,
    label: 'Recipient address',
  })
  recipientAddress: string;

  @FieldMetadata({
    universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
    type: FieldMetadataType.SELECT,
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

  @FieldMetadata({
    universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
    type: FieldMetadataType.DATE_TIME,
    label: 'Delivered at',
    isNullable: true,
    defaultValue: null,
  })
  deliveredAt?: Date;
}
`;

describe('loadManifest (integration)', () => {
  const appName = 'my-app';
  const appDisplayName = 'My App';
  const appDescription = 'My app description';
  const appDirectory = join(tmpdir(), 'twenty-manifest-');

  beforeEach(async () => {
    await copyBaseApplicationProject({
      appName,
      appDisplayName,
      appDescription,
      appDirectory,
    });

    write(appDirectory, 'src/Account.ts', objectMock);

    write(appDirectory, 'src/hello.ts', serverlessFunctionMock);

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
    expect(yarnLock).toContain('# This file is generated by running ');

    // application
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { universalIdentifier: _, ...otherInfo } = manifest.application;
    expect(otherInfo).toEqual({
      displayName: 'My App',
      description: 'My app description',
    });

    expect(manifest.objects.length).toBe(1);

    for (const object of manifest.objects) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        universalIdentifier: _,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      'hello.ts',
    ]);
  });

  it('fails fast if TS validation fails', async () => {
    write(appDirectory, 'src/utils/broken.ts', `const x: number = 'oops';`);

    await expect(loadManifest(appDirectory)).rejects.toThrow(
      /TypeScript validation failed/,
    );
  });
});
