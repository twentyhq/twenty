export const INVENTORY_FIXTURE_PROTOCOL = {
  componentName: 'compatibility-inventory.front-component',
  storyIdPrefix:
    'frontcomponent-worker-platform-apis--compatibility-inventory-',
  frontComponentId: 'compatibility-audit',
  applicationVariables: {
    catalog: 'COMPATIBILITY_CATALOG',
    runtime: 'COMPATIBILITY_RUNTIME',
  },
  waitingForInitialization: 'waiting-for-initialization',
  testIds: {
    collect: 'compatibility-collect',
    attempt: 'compatibility-attempt',
    failure: 'compatibility-fixture-error',
    harnessError: 'compatibility-harness-error',
    output: 'compatibility-output',
  },
} as const;
