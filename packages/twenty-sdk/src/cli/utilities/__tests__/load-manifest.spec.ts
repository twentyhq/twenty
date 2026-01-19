import { join } from 'path';
import {
  loadManifest,
  type LoadManifestResult,
} from '@/cli/utilities/manifest';
import { DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/test-app/src/app/default-function.role';
import {
  POST_CARD_EXTENSION_PRIORITY_FIELD_ID,
  POST_CARD_EXTENSION_CATEGORY_FIELD_ID,
} from '@/cli/__tests__/test-app/src/app/postCard.object-extension';

const TEST_APP_PATH = join(__dirname, '../../__tests__/test-app');

describe('loadManifest with test-app', () => {
  let manifest: LoadManifestResult['manifest'];
  let packageJson: LoadManifestResult['packageJson'];
  let yarnLock: LoadManifestResult['yarnLock'];
  let warnings: LoadManifestResult['warnings'];
  let shouldGenerate: LoadManifestResult['shouldGenerate'];

  beforeAll(async () => {
    const result = await loadManifest(TEST_APP_PATH);

    manifest = result.manifest;
    packageJson = result.packageJson;
    yarnLock = result.yarnLock;
    warnings = result.warnings;
    shouldGenerate = result.shouldGenerate;
  }, 15_000);

  it('should load manifest from test-app directory', async () => {
    // Check package.json loaded correctly
    expect(packageJson.name).toBe('test-app');
    expect(packageJson.version).toBe('0.0.1');

    // Check yarn.lock exists (can be empty)
    expect(yarnLock).toBeDefined();

    // Check no warnings
    expect(warnings).toEqual([]);

    // Check application config
    expect(manifest.application).toBeDefined();
    expect(manifest.application.universalIdentifier).toBe(
      '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
    );
    expect(manifest.application.displayName).toBe('Hello World');
    expect(manifest.application.description).toBe('A simple hello world app');
    expect(manifest.application.icon).toBe('IconWorld');

    expect(manifest.objects).toHaveLength(1);

    const postCard = manifest.objects[0];
    expect(postCard.universalIdentifier).toBe(
      '54b589ca-eeed-4950-a176-358418b85c05',
    );
    expect(postCard.nameSingular).toBe('postCard');
    expect(postCard.namePlural).toBe('postCards');
    expect(postCard.labelSingular).toBe('Post card');
    expect(postCard.labelPlural).toBe('Post cards');
    expect(postCard.icon).toBe('IconMail');

    // Check fields
    expect(postCard.fields).toHaveLength(5);

    const contentField = postCard.fields?.find(
      (field: { name: string }) => field.name === 'content',
    );
    expect(contentField).toBeDefined();
    expect(contentField?.universalIdentifier).toBe(
      '58a0a314-d7ea-4865-9850-7fb84e72f30b',
    );
    expect(contentField?.type).toBe('TEXT');
    expect(contentField?.label).toBe('Content');

    const statusField = postCard.fields?.find(
      (field: { name: string }) => field.name === 'status',
    );
    expect(statusField).toBeDefined();
    expect(statusField?.type).toBe('SELECT');

    expect(manifest.serverlessFunctions).toHaveLength(2);

    const testFunction = manifest.serverlessFunctions[1];
    expect(testFunction.universalIdentifier).toBe(
      'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    );
    expect(testFunction.name).toBe('test-function');
    expect(testFunction.timeoutSeconds).toBe(2);
    expect(testFunction.handlerName).toBe('handler');
    expect(testFunction.handlerPath).toBe('src/app/test-function.function.ts');

    // Check triggers
    expect(testFunction.triggers).toHaveLength(3);

    const routeTrigger = testFunction.triggers.find(
      (trigger: { type: string }) => trigger.type === 'route',
    ) as any;
    expect(routeTrigger).toBeDefined();
    expect(routeTrigger?.universalIdentifier).toBe(
      'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
    );
    expect(routeTrigger?.path).toBe('/post-card/create');
    expect(routeTrigger?.httpMethod).toBe('GET');
    expect(routeTrigger?.forwardedRequestHeaders).toEqual(['signature']);

    const cronTrigger = testFunction.triggers.find(
      (trigger: { type: string }) => trigger.type === 'cron',
    ) as any;
    expect(cronTrigger).toBeDefined();
    expect(cronTrigger?.pattern).toBe('0 0 1 1 *');

    const dbEventTrigger = testFunction.triggers.find(
      (trigger: { type: string }) => trigger.type === 'databaseEvent',
    ) as any;
    expect(dbEventTrigger).toBeDefined();
    expect(dbEventTrigger?.eventName).toBe('person.created');

    // Second function
    const testFunction2 = manifest.serverlessFunctions[0];
    expect(testFunction2.universalIdentifier).toBe(
      'eb3ffc98-88ec-45d4-9b4a-56833b219ccb',
    );
    expect(testFunction2.name).toBe('test-function-2');
    expect(testFunction2.timeoutSeconds).toBe(2);
    expect(testFunction2.handlerName).toBe('testFunction2');
    expect(testFunction2.handlerPath).toBe('src/utils/test-function-2.util.ts');

    expect(manifest.roles).toHaveLength(1);

    const role = manifest.roles![0];
    expect(role.universalIdentifier).toBe(
      'b648f87b-1d26-4961-b974-0908fd991061',
    );
    expect(role.label).toBe('Default function role');
    expect(role.description).toBe('Default role for function Twenty client');
    expect(role.canReadAllObjectRecords).toBe(false);
    expect(role.canUpdateAllObjectRecords).toBe(false);

    // Check object permissions
    expect(role.objectPermissions).toHaveLength(1);
    expect(role.objectPermissions![0].objectNameSingular).toBe('postCard');
    expect(role.objectPermissions![0].canReadObjectRecords).toBe(true);
    expect(role.objectPermissions![0].canUpdateObjectRecords).toBe(true);

    // Check field permissions
    expect(role.fieldPermissions).toHaveLength(1);
    expect(role.fieldPermissions![0].objectNameSingular).toBe('postCard');
    expect(role.fieldPermissions![0].fieldName).toBe('content');
    expect(role.fieldPermissions![0].canReadFieldValue).toBe(false);

    expect(manifest.sources).toBeDefined();
    expect(manifest.sources['src']).toBeDefined();

    // Check that the source files are loaded
    const srcSources = manifest.sources['src'] as Record<string, unknown>;
    const appSources = srcSources['app'] as Record<string, string>;
    expect(appSources['application.config.ts']).toBeDefined();
    expect(appSources['postCard.object.ts']).toBeDefined();
    expect(appSources['test-function.function.ts']).toBeDefined();
    expect(appSources['default-function.role.ts']).toBeDefined();

    // Verify source content contains expected code
    expect(appSources['application.config.ts']).toContain('defineApp');
    expect(appSources['postCard.object.ts']).toContain('defineObject');
    expect(appSources['test-function.function.ts']).toContain('defineFunction');
    expect(appSources['default-function.role.ts']).toContain('defineRole');
    expect(appSources['postCard.object-extension.ts']).toContain(
      'extendObject',
    );

    // Check object extensions
    expect(manifest.objectExtensions).toBeDefined();
    expect(manifest.objectExtensions).toHaveLength(1);

    const postCardExtension = manifest.objectExtensions![0];
    expect(postCardExtension.targetObject.nameSingular).toBe('postCard');
    expect(postCardExtension.fields).toHaveLength(2);

    const priorityField = postCardExtension.fields.find(
      (field: { name: string }) => field.name === 'priority',
    );
    expect(priorityField).toBeDefined();
    expect(priorityField?.universalIdentifier).toBe(
      POST_CARD_EXTENSION_PRIORITY_FIELD_ID,
    );
    expect(priorityField?.type).toBe('NUMBER');
    expect(priorityField?.label).toBe('Priority');
    expect(priorityField?.description).toBe(
      'Priority level for the post card (1-10)',
    );

    const categoryField = postCardExtension.fields.find(
      (field: { name: string }) => field.name === 'category',
    );
    expect(categoryField).toBeDefined();
    expect(categoryField?.universalIdentifier).toBe(
      POST_CARD_EXTENSION_CATEGORY_FIELD_ID,
    );
    expect(categoryField?.type).toBe('SELECT');
    expect(categoryField?.label).toBe('Category');
    expect((categoryField as any)?.options).toHaveLength(3);

    expect(shouldGenerate).toBe(true);

    const expectedRoleId = DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER;

    expect(manifest.application.functionRoleUniversalIdentifier).toBe(
      expectedRoleId,
    );

    const linkedRole = manifest.roles?.find(
      (r: { universalIdentifier: string }) =>
        r.universalIdentifier === expectedRoleId,
    );
    expect(linkedRole).toBeDefined();

    expect(manifest.application.applicationVariables).toBeDefined();

    const defaultRecipient =
      manifest.application.applicationVariables?.DEFAULT_RECIPIENT_NAME;
    expect(defaultRecipient).toBeDefined();
    expect(defaultRecipient?.universalIdentifier).toBe(
      '19e94e59-d4fe-4251-8981-b96d0a9f74de',
    );
    expect(defaultRecipient?.description).toBe(
      'Default recipient name for postcards',
    );
    expect(defaultRecipient?.value).toBe('Alex Karp');
    expect(defaultRecipient?.isSecret).toBe(false);
  });
});
