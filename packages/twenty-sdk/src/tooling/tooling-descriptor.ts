import { type ToolingDescriptor } from '@/tooling/types';

import packageJson from '../../package.json';

export const TOOLING_DESCRIPTOR: ToolingDescriptor = {
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
