import {
  POST_CARD_EXTENSION_CATEGORY_FIELD_ID,
  POST_CARD_EXTENSION_PRIORITY_FIELD_ID,
} from '@/cli/__tests__/test-app/src/objects/postCard.object-extension';
import { DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/test-app/src/roles/default-function.role';
import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { join } from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';

const TEST_APP_PATH = join(__dirname, '../../../../__tests__/test-app');

describe('runManifestBuild with test-app', () => {
  let manifest: ApplicationManifest;

  beforeAll(async () => {
    const result = await runManifestBuild(TEST_APP_PATH, {
      display: false,
      writeOutput: false,
    });

    if (!result) {
      throw new Error('Failed to build manifest');
    }

    manifest = result;
  }, 15_000);

  describe('application', () => {
    it('should load application config', () => {
      expect(manifest.packageJson.name).toBe('test-app');
      expect(manifest.packageJson.version).toBe('0.0.1');

      expect(manifest.application).toBeDefined();
      expect(manifest.application.universalIdentifier).toBe(
        '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
      );
      expect(manifest.application.displayName).toBe('Hello World');
      expect(manifest.application.description).toBe('A simple hello world app');
      expect(manifest.application.icon).toBe('IconWorld');
    });

    it('should load application variables', () => {
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

    it('should link function role', () => {
      const expectedRoleId = DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER;

      expect(manifest.application.functionRoleUniversalIdentifier).toBe(
        expectedRoleId,
      );

      const linkedRole = manifest.roles?.find(
        (r: { universalIdentifier: string }) =>
          r.universalIdentifier === expectedRoleId,
      );
      expect(linkedRole).toBeDefined();
    });
  });

  describe('objects', () => {
    it('should load all objects (root + subfolder)', () => {
      expect(manifest.objects).toHaveLength(2);
    });

    it('should handle object at root level', () => {
      const rootNote = manifest.objects.find(
        (o) => o.nameSingular === 'rootNote',
      );

      expect(rootNote).toBeDefined();
      expect(rootNote?.universalIdentifier).toBe(
        'b0b1b2b3-b4b5-4000-8000-000000000001',
      );
      expect(rootNote?.labelSingular).toBe('Root note');
      expect(rootNote?.fields).toHaveLength(2);
    });

    it('should handle object in subfolder', () => {
      const postCard = manifest.objects.find(
        (o) => o.nameSingular === 'postCard',
      );

      expect(postCard).toBeDefined();
      expect(postCard?.universalIdentifier).toBe(
        '54b589ca-eeed-4950-a176-358418b85c05',
      );
      expect(postCard?.namePlural).toBe('postCards');
      expect(postCard?.labelSingular).toBe('Post card');
      expect(postCard?.labelPlural).toBe('Post cards');
      expect(postCard?.icon).toBe('IconMail');
      expect(postCard?.fields).toHaveLength(5);

      const contentField = postCard?.fields?.find((f) => f.name === 'content');
      expect(contentField?.type).toBe('TEXT');

      const statusField = postCard?.fields?.find((f) => f.name === 'status');
      expect(statusField?.type).toBe('SELECT');
    });
  });

  describe('object extensions', () => {
    it('should load object extension from subfolder', () => {
      expect(manifest.objectExtensions).toBeDefined();
      expect(manifest.objectExtensions).toHaveLength(1);

      const postCardExtension = manifest.objectExtensions![0];
      expect(postCardExtension.targetObject.nameSingular).toBe('postCard');
      expect(postCardExtension.fields).toHaveLength(2);

      const priorityField = postCardExtension.fields.find(
        (f) => f.name === 'priority',
      );
      expect(priorityField?.universalIdentifier).toBe(
        POST_CARD_EXTENSION_PRIORITY_FIELD_ID,
      );
      expect(priorityField?.type).toBe('NUMBER');

      const categoryField = postCardExtension.fields.find(
        (f) => f.name === 'category',
      );
      expect(categoryField?.universalIdentifier).toBe(
        POST_CARD_EXTENSION_CATEGORY_FIELD_ID,
      );
      expect(categoryField?.type).toBe('SELECT');
      expect((categoryField as any)?.options).toHaveLength(3);
    });
  });

  describe('roles', () => {
    it('should load all roles (root + subfolder)', () => {
      expect(manifest.roles).toHaveLength(2);
    });

    it('should handle role at root level', () => {
      const rootRole = manifest.roles?.find((r) => r.label === 'Root role');

      expect(rootRole).toBeDefined();
      expect(rootRole?.universalIdentifier).toBe(
        'c0c1c2c3-c4c5-4000-8000-000000000001',
      );
      expect(rootRole?.canReadAllObjectRecords).toBe(true);
      expect(rootRole?.canBeAssignedToUsers).toBe(true);
    });

    it('should handle role in subfolder', () => {
      const defaultRole = manifest.roles?.find(
        (r) => r.label === 'Default function role',
      );

      expect(defaultRole).toBeDefined();
      expect(defaultRole?.universalIdentifier).toBe(
        'b648f87b-1d26-4961-b974-0908fd991061',
      );
      expect(defaultRole?.description).toBe(
        'Default role for function Twenty client',
      );
      expect(defaultRole?.canReadAllObjectRecords).toBe(false);
      expect(defaultRole?.objectPermissions).toHaveLength(1);
      expect(defaultRole?.fieldPermissions).toHaveLength(1);
    });
  });

  describe('serverless functions', () => {
    it('should load all functions', () => {
      expect(manifest.serverlessFunctions).toHaveLength(4);
    });

    it('should handle function at root level (inline handler)', () => {
      const rootFn = manifest.serverlessFunctions.find(
        (f) => f.name === 'root-function',
      );

      expect(rootFn).toBeDefined();
      expect(rootFn?.universalIdentifier).toBe(
        'f0f1f2f3-f4f5-4000-8000-000000000001',
      );
      expect(rootFn?.handlerName).toBe('rootHandler');
      expect(rootFn?.handlerPath).toBe('src/root.function.ts');

      const routeTrigger = rootFn?.triggers.find(
        (t) => t.type === 'route',
      ) as any;
      expect(routeTrigger?.path).toBe('/root');
    });

    it('should handle function in subfolder (inline handler)', () => {
      const testFn = manifest.serverlessFunctions.find(
        (f) => f.name === 'test-function',
      );

      expect(testFn).toBeDefined();
      expect(testFn?.universalIdentifier).toBe(
        'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      );
      expect(testFn?.handlerName).toBe('handler');
      expect(testFn?.handlerPath).toBe('src/functions/test-function.function.ts');
      expect(testFn?.triggers).toHaveLength(3);
    });

    it('should handle function with handler in a different file', () => {
      const testFn2 = manifest.serverlessFunctions.find(
        (f) => f.name === 'test-function-2',
      );

      expect(testFn2).toBeDefined();
      expect(testFn2?.universalIdentifier).toBe(
        'eb3ffc98-88ec-45d4-9b4a-56833b219ccb',
      );
      expect(testFn2?.handlerName).toBe('testFunction2');
      // Handler is imported from utils/test-function-2.util.ts
      expect(testFn2?.handlerPath).toBe('src/utils/test-function-2.util.ts');
    });

    it('should handle function importing a utility', () => {
      const greetingFn = manifest.serverlessFunctions.find(
        (f) => f.name === 'greeting-function',
      );

      expect(greetingFn).toBeDefined();
      expect(greetingFn?.universalIdentifier).toBe(
        'g0g1g2g3-g4g5-4000-8000-000000000001',
      );
      expect(greetingFn?.handlerName).toBe('greetingHandler');
      // Handler is defined inline but imports utility - path should be the function file
      expect(greetingFn?.handlerPath).toBe(
        'src/functions/greeting.function.ts',
      );
    });
  });

  describe('front components', () => {
    it('should load all front components', () => {
      expect(manifest.frontComponents).toHaveLength(4);
    });

    it('should handle front component at root level (inline component)', () => {
      const rootComponent = manifest.frontComponents?.find(
        (c) => c.name === 'root-component',
      );

      expect(rootComponent).toBeDefined();
      expect(rootComponent?.universalIdentifier).toBe(
        'a0a1a2a3-a4a5-4000-8000-000000000001',
      );
      expect(rootComponent?.componentName).toBe('RootComponent');
      expect(rootComponent?.componentPath).toBe('src/root.front-component.tsx');
    });

    it('should handle front component in subfolder (inline component)', () => {
      const testComponent = manifest.frontComponents?.find(
        (c) => c.name === 'test-component',
      );

      expect(testComponent).toBeDefined();
      expect(testComponent?.universalIdentifier).toBe(
        'f1234567-abcd-4000-8000-000000000001',
      );
      expect(testComponent?.componentName).toBe('TestComponent');
      expect(testComponent?.componentPath).toBe(
        'src/components/test.front-component.tsx',
      );
    });

    it('should handle front component with component in a different file', () => {
      const cardComponent = manifest.frontComponents?.find(
        (c) => c.name === 'card-component',
      );

      expect(cardComponent).toBeDefined();
      expect(cardComponent?.universalIdentifier).toBe(
        'i0i1i2i3-i4i5-4000-8000-000000000001',
      );
      expect(cardComponent?.componentName).toBe('CardDisplay');
      // Component is imported from utils/card-display.component.tsx
      expect(cardComponent?.componentPath).toBe(
        'src/utils/card-display.component.tsx',
      );
    });

    it('should handle front component importing a utility', () => {
      const greetingComponent = manifest.frontComponents?.find(
        (c) => c.name === 'greeting-component',
      );

      expect(greetingComponent).toBeDefined();
      expect(greetingComponent?.universalIdentifier).toBe(
        'h0h1h2h3-h4h5-4000-8000-000000000001',
      );
      expect(greetingComponent?.componentName).toBe('GreetingComponent');
      // Component is defined inline but imports utility - path should be the component file
      expect(greetingComponent?.componentPath).toBe(
        'src/components/greeting.front-component.tsx',
      );
    });
  });

  describe('sources', () => {
    it('should include all source files', () => {
      expect(manifest.sources).toBeDefined();
      expect(manifest.sources['src']).toBeDefined();

      const srcSources = manifest.sources['src'] as Record<string, unknown>;

      // Root level entities
      expect(srcSources['application.config.ts']).toBeDefined();
      expect(srcSources['root.function.ts']).toBeDefined();
      expect(srcSources['root.front-component.tsx']).toBeDefined();
      expect(srcSources['root.object.ts']).toBeDefined();
      expect(srcSources['root.role.ts']).toBeDefined();

      // Subfolder entities
      const functionsSources = srcSources['functions'] as Record<string, string>;
      expect(functionsSources['test-function.function.ts']).toBeDefined();
      expect(functionsSources['test-function-2.function.ts']).toBeDefined();
      expect(functionsSources['greeting.function.ts']).toBeDefined();

      const componentsSources = srcSources['components'] as Record<
        string,
        string
      >;
      expect(componentsSources['test.front-component.tsx']).toBeDefined();
      expect(componentsSources['greeting.front-component.tsx']).toBeDefined();
      expect(componentsSources['card.front-component.tsx']).toBeDefined();

      const objectsSources = srcSources['objects'] as Record<string, string>;
      expect(objectsSources['postCard.object.ts']).toBeDefined();
      expect(objectsSources['postCard.object-extension.ts']).toBeDefined();

      const rolesSources = srcSources['roles'] as Record<string, string>;
      expect(rolesSources['default-function.role.ts']).toBeDefined();

      // Utilities
      const utilsSources = srcSources['utils'] as Record<string, string>;
      expect(utilsSources['test-function-2.util.ts']).toBeDefined();
      expect(utilsSources['greeting.util.ts']).toBeDefined();
      expect(utilsSources['card-display.component.tsx']).toBeDefined();
    });
  });
});
