import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { createToolingFailure } from '@/app/create-tooling-failure';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import {
  parseBuildData,
  parseNullData,
  parseToolingResult,
} from '@/app/parse-tooling-result';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { runAppWorker } from '@/app/run-app-worker';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import { type AppOperation } from '@/app/types/app-operation.type';
import { type AppProject } from '@/app/project/types/app-project.type';
import { type AppWorkerOutput } from '@/app/types/app-worker-output.type';
import { type ProjectSdk } from '@/app/project/types/project-sdk.type';
import {
  type ToolingBuild,
  type ToolingDiagnostic,
} from '@/app/types/tooling-result.type';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { CLI_VERSION } from '@/constants/cli-version.constant';

type AppOperationResult<TData> = {
  data: TData;
  diagnostics: ToolingDiagnostic[];
};

const PROGRESS_VERBS: Record<AppOperation, string> = {
  build: 'Building',
  typecheck: 'Typechecking',
};

const hasReleaseFailed = ({
  release,
  isSnapshotHeld,
}: {
  release?: unknown;
  isSnapshotHeld: boolean;
}) =>
  isSnapshotHeld
    ? !isPlainObject(release) || release.success !== true
    : isPlainObject(release) && release.success === false;

const runAppOperation = async <TData>({
  operation,
  parseData,
  context: { options, output, outputMode, signal },
  useHeldBuild,
}: {
  operation: AppOperation;
  parseData: (data: unknown) => { data: TData } | undefined;
  context: CommandContext;
  useHeldBuild?: (
    heldBuild: AppOperationResult<TData> & {
      project: AppProject;
      sdk: ProjectSdk;
    },
  ) => Promise<void>;
}) => {
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });
  const sdk = await resolveSourceSdk({
    appPath: project.path,
    warn: output.warn,
  });

  output.progress(
    `${PROGRESS_VERBS[operation]} ${project.name} with twenty ${CLI_VERSION}…`,
  );

  const startedAt = performance.now();
  const readBuildResult = ({
    result,
    output: workerOutput,
  }: {
    result: unknown;
    output: AppWorkerOutput;
  }): AppOperationResult<TData> => {
    const toolingResult = parseToolingResult({ value: result, parseData });
    const diagnostics = [
      ...toolingResult.diagnostics,
      ...toWorkerOutputDiagnostics(workerOutput),
    ];

    if (outputMode === 'human') {
      for (const diagnostic of diagnostics) {
        output.progress(formatToolingDiagnostic(diagnostic));
      }
    }

    if (!toolingResult.success) {
      throw createToolingFailure({
        error: toolingResult.error,
        diagnostics,
        sdkVersion: sdk.version,
      });
    }

    return { data: toolingResult.data, diagnostics };
  };
  let heldBuildResult: AppOperationResult<TData> | undefined;

  const workerRun = await runAppWorker({
    request:
      operation === 'build'
        ? {
            type: 'bundleSnapshot',
            appPath: project.path,
            holdSnapshot: isDefined(useHeldBuild),
          }
        : { type: 'typecheckSource', appPath: project.path },
    signal,
    ...(isDefined(useHeldBuild)
      ? {
          useHeldSnapshot: async (heldBuild) => {
            heldBuildResult = readBuildResult(heldBuild);

            await useHeldBuild({ project, sdk, ...heldBuildResult });
          },
        }
      : {}),
  });

  if (!isDefined(heldBuildResult)) {
    signal.throwIfAborted();
  }

  const { data, diagnostics } = heldBuildResult ?? readBuildResult(workerRun);

  if (hasReleaseFailed(workerRun)) {
    output.warn({
      code: 'SNAPSHOT_RELEASE_FAILED',
      message:
        'The temporary build snapshot could not be removed. You can delete .twenty/cli/snapshots once no build is running.',
    });
  }

  return {
    project,
    sdk,
    data,
    diagnostics,
    durationMilliseconds: Math.round(performance.now() - startedAt),
  };
};

export const runAppBuild = ({
  context,
  useHeldBuild,
}: {
  context: CommandContext;
  useHeldBuild?: (
    heldBuild: AppOperationResult<ToolingBuild> & {
      project: AppProject;
      sdk: ProjectSdk;
    },
  ) => Promise<void>;
}) =>
  runAppOperation({
    operation: 'build',
    parseData: parseBuildData,
    context,
    useHeldBuild,
  });

export const runAppTypecheck = ({ context }: { context: CommandContext }) =>
  runAppOperation({
    operation: 'typecheck',
    parseData: parseNullData,
    context,
  });
