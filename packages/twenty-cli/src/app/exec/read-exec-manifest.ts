import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { createToolingFailure } from '@/app/create-tooling-failure';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { parseToolingResult } from '@/app/parse-tooling-result';
import { isExportedManifest } from '@/app/pull/is-exported-manifest';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { runAppWorker } from '@/app/run-app-worker';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandContext } from '@/catalog/types/command-context.type';

export const readExecManifest = async ({
  options,
  output,
  outputMode,
  signal,
}: CommandContext) => {
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });
  const sdk = await resolveSourceSdk({
    appPath: project.path,
    warn: output.warn,
  });

  output.progress(`Reading app definitions in ${project.path}…`);
  const worker = await runAppWorker({
    request: { type: 'buildManifest', appPath: project.path },
    signal,
  });
  signal.throwIfAborted();
  const result = parseToolingResult({
    value: worker.result,
    parseData: (value) => {
      if (!isPlainObject(value) || !isExportedManifest(value.manifest)) {
        return;
      }
      const { manifest } = value;
      if (!isArray(manifest.logicFunctions)) {
        return;
      }

      const universalIdentifiers: string[] = [];
      for (const logicFunction of manifest.logicFunctions) {
        if (
          !isPlainObject(logicFunction) ||
          !isString(logicFunction.universalIdentifier)
        ) {
          return;
        }
        universalIdentifiers.push(
          logicFunction.universalIdentifier.toLowerCase(),
        );
      }

      const hooks: Record<string, string> = {};
      for (const key of [
        'postInstallLogicFunction',
        'preInstallLogicFunction',
        'uninstallLogicFunction',
      ]) {
        const hook = manifest.application[key];
        if (!isDefined(hook)) {
          continue;
        }
        if (!isPlainObject(hook) || !isString(hook.universalIdentifier)) {
          return;
        }
        hooks[key] = hook.universalIdentifier.toLowerCase();
      }

      return {
        data: {
          applicationUniversalIdentifier:
            manifest.application.universalIdentifier.toLowerCase(),
          universalIdentifiers,
          hooks,
        },
      };
    },
  });
  const diagnostics = [
    ...result.diagnostics,
    ...toWorkerOutputDiagnostics(worker.output),
  ];

  if (outputMode === 'human') {
    for (const diagnostic of diagnostics) {
      output.progress(formatToolingDiagnostic(diagnostic));
    }
  }
  if (!result.success) {
    throw createToolingFailure({
      error: result.error,
      diagnostics,
      sdkVersion: sdk.version,
    });
  }

  return { ...result.data, diagnostics };
};

export type ExecManifest = Awaited<ReturnType<typeof readExecManifest>>;
