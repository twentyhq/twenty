import { FieldType } from '@/sdk';
import type { Manifest } from 'twenty-shared/application';

export const EXPECTED_MANIFEST: Manifest = {
  application: {
    universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
    displayName: 'Root App',
    description: 'An app with all entities at root level',
    icon: 'IconFolder',
    defaultRoleUniversalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000002',
    packageJsonChecksum: '351460efb13a6c1bee63e27cf87f6ece',
    yarnLockChecksum: 'd41d8cd98f00b204e9800998ecf8427e',
  },
  publicAssets: [],
  fields: [],
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
  logicFunctions: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000010',
      name: 'my-function',
      timeoutSeconds: 5,
      httpRouteTriggerSettings: {
        path: '/my-function',
        httpMethod: 'GET',
        isAuthRequired: false,
      },
      handlerName: 'default.config.handler',
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
