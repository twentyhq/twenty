import { type BuildDescriptor } from '@/application-build/types';

import packageJson from '../../package.json';

export const BUILD_DESCRIPTOR: BuildDescriptor = {
  protocolVersion: 1,
  sdkVersion: packageJson.version,
  requiredNode: packageJson.engines.node,
  capabilities: ['build', 'typecheck', 'releaseSnapshot', 'generateClient'],
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
  },
};
