import { type BuildDescriptor } from '@/application-build/types';

import packageJson from '../../package.json';

export const BUILD_DESCRIPTOR: BuildDescriptor = {
  protocolVersion: 1,
  sdkVersion: packageJson.version,
  requiredNode: packageJson.engines.node,
  capabilities: [
    'build',
    'typecheck',
    'releaseSnapshot',
    'generateClient',
    'readIdentity',
    'pull',
    'recordBase',
  ],
  fileWrites: {
    build: ['.twenty/snapshots/**'],
    typecheck: [],
    releaseSnapshot: ['.twenty/snapshots/**'],
    generateClient: [
      'node_modules/twenty-client-sdk/dist/core/generated/**',
      'node_modules/twenty-client-sdk/dist/core/generated.tmp/**',
      'node_modules/twenty-client-sdk/dist/core.mjs',
      'node_modules/twenty-client-sdk/dist/core.cjs',
    ],
    readIdentity: [],
    pull: [
      '**/*.ts',
      '**/*.tsx',
      'locales/**',
      '.twenty/pull-base.json',
      '.twenty/pull-staging-*/**',
      '.twenty/pull-backup-*/**',
    ],
    recordBase: [
      '.twenty/pull-base.json',
      '.twenty/pull-staging-*/**',
      '.twenty/pull-backup-*/**',
    ],
  },
};
