import { type Application } from '~/generated/graphql';

export const CUSTOM_WORKSPACE_APPLICATION_MOCK = {
  id: 'dc75f982-35a2-4c1b-a63d-bd1131215377',
  agents: [],
  applicationVariables: [],
  canBeUninstalled: false,
  description: 'workpace custom application',
  name: 'custom',
  objects: [],
  serverlessFunctions: [],
  universalIdentifier: '66a698b6-f6c1-4d35-a6e7-20aeadc3cd95',
  version: '1.0.0',
} as const satisfies Application;
