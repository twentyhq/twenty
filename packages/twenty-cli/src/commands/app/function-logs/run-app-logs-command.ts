import { once } from 'node:events';

import { isDefined } from 'twenty-shared/utils';

import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { readLogsFilter } from '@/app/function-logs/read-logs-filter';
import { subscribeToAppLogs } from '@/app/function-logs/subscribe-to-app-logs';
import { readAppIdentity } from '@/app/read-app-identity';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { colorText, dimText, formatWarningLine } from '@/output/style';
import { toCliError } from '@/output/to-cli-error';
import { toPublicTarget } from '@/target/to-public-target';

export const runAppLogsCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const { options, output, outputMode, signal, target } = context;
  const filter = readLogsFilter(options);
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });
  const identity = await readAppIdentity({
    appPath: project.path,
    signal,
    warn: output.warn,
  });
  if (!isDefined(identity.application)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: 'This project has no application definition.',
    });
  }
  const applicationUniversalIdentifier =
    identity.application.universalIdentifier.toLowerCase();
  let recordCount = 0;

  await output.event(
    'start',
    {
      target: toPublicTarget(target),
      applicationUniversalIdentifier,
      filter,
      diagnostics: identity.diagnostics,
    },
    signal,
  );
  if (outputMode === 'human') {
    for (const diagnostic of identity.diagnostics) {
      output.progress(formatToolingDiagnostic(diagnostic));
    }
    output.progress(
      `Watching ${formatDataValue(identity.application.displayName ?? applicationUniversalIdentifier)} logs on ${target.apiUrl}. New executions only. Press Ctrl+C to stop.`,
    );
  }

  try {
    await subscribeToAppLogs({
      applicationUniversalIdentifier,
      filter,
      target,
      signal,
      onConnected: () =>
        output.event('progress', { kind: 'connected' }, signal),
      onIdentityUnavailable: async () => {
        const warning = {
          code: 'LOG_IDENTITY_UNAVAILABLE',
          message:
            'This server returns log text without function identities. Mixed logs cannot be attributed to individual functions; use --universal-identifier to isolate one, or upgrade the server.',
        };
        if (outputMode === 'human') {
          output.progress(formatWarningLine(warning.message));
        } else {
          output.warn(warning);
        }
      },
      onRecord: async (record) => {
        if (outputMode === 'ndjson') {
          await output.event('record', record, signal);
        } else {
          const label = [
            ...(isDefined(record.functionName)
              ? [colorText('cyan', formatDataValue(record.functionName))]
              : []),
            ...(isDefined(record.functionUniversalIdentifier)
              ? [dimText(formatDataValue(record.functionUniversalIdentifier))]
              : []),
          ].join(' · ');
          const text = [
            ...(label.length > 0 ? [`[${label}]`] : []),
            ...record.logs.replace(/\n$/, '').split('\n').map(formatDataValue),
          ].join('\n');
          signal.throwIfAborted();
          if (!process.stdout.write(`${text}\n`)) {
            await once(process.stdout, 'drain', { signal });
          }
          signal.throwIfAborted();
        }
        recordCount += 1;
      },
    });
  } catch (error) {
    const failure = toCliError(error, signal);
    throw new CliError({
      code: failure.code,
      exitCode: failure.exitCode,
      message: failure.message,
      hint:
        failure.code === 'NETWORK_ERROR'
          ? 'Restart twenty app logs to resume watching. Logs produced while disconnected cannot be replayed.'
          : failure.hint,
      details: {
        ...failure.details,
        applicationUniversalIdentifier,
        filter,
        recordCount,
      },
    });
  }

  return {
    data: { applicationUniversalIdentifier, filter, recordCount },
    human: 'Log stream completed.',
  };
};
