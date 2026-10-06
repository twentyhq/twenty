import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fetchAppExport } from '@/app/fetch-app-export';
import { fetchWorkspaceId } from '@/app/fetch-workspace-id';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { parseToolingResult } from '@/app/parse-tooling-result';
import { formatPullReport } from '@/app/pull/format-pull-report';
import { parsePullData } from '@/app/pull/parse-pull-data';
import { readAppIdentity } from '@/app/read-app-identity';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { runAppWorker } from '@/app/run-app-worker';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatSuccessLine } from '@/output/style';

export const runAppPullCommand: CommandRun<TargetCommandContext> = async ({
  options,
  target,
  signal,
  output,
  outputMode,
}) => {
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });

  const explicitIdentifier = readStringOption(options, 'universalIdentifier');

  if (
    isDefined(explicitIdentifier) &&
    !isValidUniversalIdentifier(explicitIdentifier)
  ) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: '--universal-identifier must be a UUID of version 4 or later.',
    });
  }

  const identity = await readAppIdentity({ appPath: project.path, signal });

  const universalIdentifier = (
    explicitIdentifier ?? identity.application?.universalIdentifier
  )?.toLowerCase();

  if (!isDefined(universalIdentifier)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: 'This project has no application definition.',
      hint: 'Pass --universal-identifier <uuid> to pull an app into this project.',
    });
  }

  if (
    isDefined(identity.application) &&
    identity.application.universalIdentifier.toLowerCase() !==
      universalIdentifier
  ) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: `This project declares application ${identity.application.universalIdentifier}, not ${universalIdentifier}. Pull it into a different directory.`,
    });
  }
  output.progress(`Exporting the app from ${target.apiUrl}…`);

  const [workspaceId, applicationExport] = await Promise.all([
    fetchWorkspaceId({ target, signal }),
    fetchAppExport({ universalIdentifier, target, signal }),
  ]);
  output.progress(
    'Reconciling local definitions. Changed workspace entities replace local edits…',
  );

  const worker = await runAppWorker({
    request: {
      type: 'pull',
      appPath: project.path,
      target: { apiUrl: target.apiUrl, workspaceId },
      applicationExport,
    },
    signal,
  }).catch((error: unknown) => {
    throw new CliError({
      code: error instanceof CliError ? error.code : 'PULL_FAILED',
      exitCode: error instanceof CliError ? error.exitCode : EXIT_CODE.FAILURE,
      message: error instanceof Error ? error.message : String(error),
      hint: 'The worker did not acknowledge completion. Inspect local changes and any backups in .twenty/cli/pull-backup-* before retrying.',
      details: {
        ...(error instanceof CliError ? error.details : {}),
        outcome: 'unknown',
      },
    });
  });

  const result = parseToolingResult({
    value: worker.result,
    parseData: parsePullData,
  });

  const diagnostics = [
    ...identity.diagnostics,
    ...result.diagnostics,
    ...toWorkerOutputDiagnostics(worker.output),
  ];

  if (outputMode === 'human') {
    for (const diagnostic of diagnostics) {
      output.progress(formatToolingDiagnostic(diagnostic));
    }
  }

  if (!result.success) {
    throw new CliError({
      code:
        result.error.code === 'CANCELLED'
          ? 'CANCELLED'
          : result.error.code === 'SDK_SOURCE_UNSUPPORTED'
            ? 'SDK_SOURCE_UNSUPPORTED'
            : 'PULL_FAILED',
      exitCode:
        result.error.code === 'CANCELLED'
          ? EXIT_CODE.CANCELLED
          : EXIT_CODE.FAILURE,
      message: result.error.message,
      hint:
        result.error.hint ??
        (result.error.code === 'SDK_SOURCE_UNSUPPORTED'
          ? 'Upgrade the app to a compatible twenty-sdk version (2.40.0 or later).'
          : undefined),
      details: { ...result.error.details, diagnostics },
    });
  }

  const data = result.data;

  if (
    data.skipped.length > 0 ||
    data.unreadableRelativePaths.length > 0 ||
    applicationExport.coverage.some(
      (entry) => !['EXPORTED', 'ENGINE_DERIVED'].includes(entry.status),
    )
  ) {
    output.warn({
      code: 'PULL_INCOMPLETE',
      message:
        'Some entities could not be written. See coverage, skipped entities and unreadable files in the pull report.',
    });
  }

  const report = formatPullReport({
    ...data,
    writes: data.writes.map((entry) => ({
      ...entry,
      relativePath: formatDataValue(entry.relativePath),
    })),
    deletions: data.deletions.map((entry) => ({
      ...entry,
      relativePath: formatDataValue(entry.relativePath),
    })),
    skipped: data.skipped.map((entry) => ({
      ...entry,
      reason: formatDataValue(entry.reason),
    })),
    localOnlyRelativePaths: data.localOnlyRelativePaths.map(formatDataValue),
    unreadableRelativePaths: data.unreadableRelativePaths.map(formatDataValue),
    entityLabelByUniversalIdentifier: Object.fromEntries(
      Object.entries(data.entityLabelByUniversalIdentifier).map(
        ([identifier, label]) => [identifier, formatDataValue(label)],
      ),
    ),
    coverage: applicationExport.coverage.map((entry) => ({
      ...entry,
      metadataName: formatDataValue(entry.metadataName),
      universalIdentifier: formatDataValue(entry.universalIdentifier),
      reason: entry.reason === null ? null : formatDataValue(entry.reason),
    })),
    verbose: readBooleanOption(options, 'verbose'),
  });

  const unknownCoverage = applicationExport.coverage.filter(
    (entry) =>
      ![
        'EXPORTED',
        'UNSUPPORTED',
        'FOREIGN_OWNED',
        'EXCLUDED',
        'ENGINE_DERIVED',
      ].includes(entry.status),
  );

  return {
    data: {
      app: { path: project.path, name: project.name },
      ...data,
      pulled: true,
      coverage: applicationExport.coverage,
      diagnostics,
    },
    human: [
      formatSuccessLine(
        `Pulled ${formatDataValue(data.application.displayName)} into ${formatDataValue(project.path)}`,
      ),
      report,
      ...(data.base.status !== 'used'
        ? [
            `No matching pull base (${data.base.status}); local-only definitions were kept.`,
          ]
        : []),
      ...(data.overwrittenLocalChanges.length > 0
        ? [
            'Local edits replaced by workspace changes:',
            ...data.overwrittenLocalChanges.map(
              (entry) => `  ${formatDataValue(entry.relativePath)}`,
            ),
          ]
        : []),
      ...(unknownCoverage.length > 0
        ? [
            'Unrecognized coverage, not written:',
            ...unknownCoverage.map(
              (entry) =>
                `  ${formatDataValue(entry.metadataName)} ${formatDataValue(entry.status)}: ${formatDataValue(entry.reason)}`,
            ),
          ]
        : []),
      'Run twenty app typecheck to check the generated definitions.',
    ]
      .filter(Boolean)
      .join('\n'),
  };
};
