import { FieldType } from '@/application';
import type { ApplicationManifest } from 'twenty-shared/application';

export const EXPECTED_MANIFEST: ApplicationManifest = {
  sources: {},
  yarnLock: '',
  packageJson: {
    name: 'root-app',
    version: '0.1.0',
    license: 'MIT',
    engines: {
      node: '^24.5.0',
      npm: 'please-use-yarn',
      yarn: '>=4.0.2',
    },
    packageManager: 'yarn@4.9.2',
    scripts: {
      'auth:login': 'twenty auth:login',
      'auth:logout': 'twenty auth:logout',
      'auth:status': 'twenty auth:status',
      'auth:switch': 'twenty auth:switch',
      'auth:list': 'twenty auth:list',
      'app:dev': 'twenty app:dev',
      'entity:add': 'twenty entity:add',
      'app:generate': 'twenty app:generate',
      'function:logs': 'twenty function:logs',
      'function:execute': 'twenty function:execute',
      'app:uninstall': 'twenty app:uninstall',
      help: 'twenty help',
      lint: 'eslint',
      'lint:fix': 'eslint --fix',
    },
    dependencies: {
      'twenty-sdk': 'latest',
    },
    devDependencies: {
      typescript: '^5.9.3',
      '@types/node': '^24.7.2',
      '@types/react': '^19.0.2',
      react: '^19.0.2',
      eslint: '^9.32.0',
      'typescript-eslint': '^8.50.0',
    },
  },
  application: {
    universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
    displayName: 'Root App',
    description: 'An app with all entities at root level',
    icon: 'IconFolder',
    functionRoleUniversalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000002',
  },
  objects: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000030',
      nameSingular: 'myNote',
      namePlural: 'myNotes',
      labelSingular: 'My note',
      labelPlural: 'My notes',
      description: 'A simple root-level object',
      icon: 'IconNote',
      fields: [
        {
          universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000031',
          type: FieldType.TEXT,
          label: 'Title',
          name: 'title',
        },
      ],
    },
  ],
  functions: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000010',
      name: 'my-function',
      timeoutSeconds: 5,
      triggers: [
        {
          universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000011',
          type: 'route',
          path: '/my-function',
          httpMethod: 'GET',
          isAuthRequired: false,
        },
      ],
      handlerName: 'default.handler',
      sourceHandlerPath: 'my.function.ts',
      builtHandlerPath: 'my.function.mjs',
      builtHandlerChecksum: '[checksum]',
    },
  ],
  frontComponents: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000020',
      name: 'my-component',
      description: 'A root-level front component',
      componentName: 'MyComponent',
      sourceComponentPath: 'my.front-component.tsx',
      builtComponentPath: 'my.front-component.mjs',
      builtComponentChecksum: '[checksum]',
    },
  ],
  roles: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000040',
      label: 'My role',
      description: 'A simple root-level role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canUpdateAllSettings: false,
      canBeAssignedToAgents: false,
      canBeAssignedToUsers: true,
      canBeAssignedToApiKeys: false,
    },
  ],
};
