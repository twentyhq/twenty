import { type BuildDescriptor } from '@/application-build/types';

import packageJson from '../../package.json';

export const BUILD_DESCRIPTOR: BuildDescriptor = {
  protocolVersion: 1,
  sdkVersion: packageJson.version,
  requiredNode: packageJson.engines.node,
  capabilities: ['build', 'typecheck', 'releaseSnapshot'],
  fileWrites: {
    build: ['.twenty/snapshots/**'],
    typecheck: [],
    releaseSnapshot: ['.twenty/snapshots/**'],
  },
};
