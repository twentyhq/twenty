import {
  type PullAppOptions,
  type PullAppResult,
  type ReadAppIdentityResult,
} from '@/application-build/pull/types';
import {
  type BuildOperationOptions,
  type BuildResult,
  type BuildSnapshot,
  type GenerateAppClientOptions,
} from '@/application-build/types';

export { BUILD_DESCRIPTOR } from '@/application-build/build-descriptor';
export type {
  AppIdentity,
  AppPullTarget,
  PullAppOptions,
  PullAppResult,
  PullBaseStatus,
  ReadAppIdentityResult,
} from '@/application-build/pull/types';
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

export const readAppIdentity = async (
  options: BuildOperationOptions,
): Promise<BuildResult<ReadAppIdentityResult>> =>
  (
    await import('@/application-build/pull/read-application-identity')
  ).readApplicationIdentity(options);

export const pullApp = async (
  options: PullAppOptions,
): Promise<BuildResult<PullAppResult>> =>
  (await import('@/application-build/pull/pull-application')).pullApplication(
    options,
  );

export const recordAppBase = async (
  options: PullAppOptions,
): Promise<BuildResult<null>> =>
  (
    await import('@/application-build/pull/record-application-base')
  ).recordApplicationBase(options);
