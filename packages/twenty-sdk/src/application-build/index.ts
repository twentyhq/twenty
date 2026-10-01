import {
  type BuildOperationOptions,
  type BuildResult,
  type BuildSnapshot,
  type GenerateAppClientOptions,
} from '@/application-build/types';

export { BUILD_DESCRIPTOR } from '@/application-build/build-descriptor';
export type {
  BuildArtifact,
  BuildArtifactRole,
  BuildSnapshot,
  BuildCapability,
  BuildDescriptor,
  BuildDiagnostic,
  BuildErrorCode,
  BuildOperationOptions,
  BuildResult,
  GenerateAppClientOptions,
} from '@/application-build/types';

export const buildAppSnapshot = async (
  options: BuildOperationOptions,
): Promise<BuildResult<BuildSnapshot>> =>
  (await import('@/application-build/build-snapshot')).buildSnapshot(options);

export const typecheckApp = async (
  options: BuildOperationOptions,
): Promise<BuildResult<null>> =>
  (
    await import('@/application-build/typecheck-application')
  ).typecheckApplication(options);

export const releaseAppSnapshot = async (options: {
  buildId: string;
}): Promise<BuildResult<null>> =>
  (await import('@/application-build/build-snapshot')).releaseSnapshot(options);

export const generateAppClient = async (
  options: GenerateAppClientOptions,
): Promise<BuildResult<null>> =>
  (
    await import('@/application-build/generate-application-client')
  ).generateApplicationClient(options);
