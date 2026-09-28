import { type ToolingApi } from '@/tooling/types';

import { TOOLING_DESCRIPTOR } from '@/tooling/tooling-descriptor';

export type {
  ToolingApi,
  ToolingArtifact,
  ToolingArtifactRole,
  ToolingBuildSnapshot,
  ToolingCapability,
  ToolingDescriptor,
  ToolingDiagnostic,
  ToolingErrorCode,
  ToolingOperationOptions,
  ToolingResult,
} from '@/tooling/types';

export const tooling: ToolingApi = {
  descriptor: TOOLING_DESCRIPTOR,
  build: async (options) =>
    (await import('@/tooling/build-snapshot')).buildSnapshot(options),
  typecheck: async (options) =>
    (await import('@/tooling/typecheck-application')).typecheckApplication(
      options,
    ),
  releaseSnapshot: async (options) =>
    (await import('@/tooling/build-snapshot')).releaseSnapshot(options),
};
