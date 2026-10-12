import { createRequire } from 'node:module';
import { join } from 'node:path';

type TestTooling = {
  buildSourceSnapshot: (options: {
    appPath: string;
    signal: AbortSignal;
  }) => Promise<unknown>;
  releaseSourceSnapshot: (options: { buildId: string }) => Promise<unknown>;
  typecheckApplication: (options: {
    appPath: string;
    signal: AbortSignal;
  }) => Promise<unknown>;
  generateApplicationClient: (options: {
    appPath: string;
    schema: string;
    signal: AbortSignal;
  }) => Promise<unknown>;
};

const loadTooling = (appPath: string): TestTooling =>
  createRequire(join(appPath, 'package.json'))(
    join(appPath, 'test-tooling.cjs'),
  );

let snapshotTooling: TestTooling;

export const buildSourceSnapshot = async (
  options: Parameters<TestTooling['buildSourceSnapshot']>[0],
) => {
  snapshotTooling = loadTooling(options.appPath);

  return snapshotTooling.buildSourceSnapshot(options);
};

export const releaseSourceSnapshot = (
  options: Parameters<TestTooling['releaseSourceSnapshot']>[0],
) => snapshotTooling.releaseSourceSnapshot(options);

export const typecheckApplication = (
  options: Parameters<TestTooling['typecheckApplication']>[0],
) => loadTooling(options.appPath).typecheckApplication(options);

export const generateApplicationClient = (
  options: Parameters<TestTooling['generateApplicationClient']>[0],
) => loadTooling(options.appPath).generateApplicationClient(options);
