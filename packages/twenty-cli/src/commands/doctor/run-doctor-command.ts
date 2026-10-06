import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { getConfigPath } from '@/config/get-config-path';
import { formatDoctorChecks } from '@/doctor/format-doctor-checks';
import { getConnectionDoctorChecks } from '@/doctor/get-connection-doctor-checks';
import { getPathDoctorCheck } from '@/doctor/get-path-doctor-check';
import { getProjectDoctorChecks } from '@/doctor/get-project-doctor-checks';
import { getRuntimeDoctorChecks } from '@/doctor/get-runtime-doctor-checks';
import { CliError } from '@/output/cli-error';

export const runDoctorCommand: CommandRun = async ({
  options,
  signal,
  outputMode,
}) => {
  const checks = getRuntimeDoctorChecks();
  const workingDirectory = process.cwd();

  try {
    checks.push(
      await getPathDoctorCheck({
        environment: process.env,
        workingDirectory,
        signal,
      }),
    );
  } catch {
    signal.throwIfAborted();
    checks.push({
      id: 'path',
      status: 'fail',
      message: 'Could not inspect executables on PATH.',
    });
  }

  checks.push(
    ...(await getProjectDoctorChecks({
      explicitPath: readStringOption(options, 'path'),
      workingDirectory,
      signal,
    })),
  );
  checks.push(
    ...(await getConnectionDoctorChecks({
      environment: process.env,
      configPath: getConfigPath(),
      remoteFlag: readStringOption(options, 'remote'),
      offline: readBooleanOption(options, 'offline'),
      signal,
    })),
  );
  signal.throwIfAborted();

  const failedChecks = checks.filter((check) => check.status === 'fail');
  const human = formatDoctorChecks(checks);

  if (isNonEmptyArray(failedChecks)) {
    throw new CliError({
      code: 'DOCTOR_FAILED',
      message: `${failedChecks.length} doctor ${failedChecks.length === 1 ? 'check' : 'checks'} failed.`,
      hint:
        outputMode === 'human'
          ? human
          : 'Read error.details.checks for the failures and recovery hints.',
      details: { checks },
    });
  }

  return { data: { checks }, human };
};
