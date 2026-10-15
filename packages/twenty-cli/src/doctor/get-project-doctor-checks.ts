import { isDefined } from 'twenty-shared/utils';

import { resolveAppProject } from '@/app/project/resolve-app-project';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { type AppProject } from '@/app/project/types/app-project.type';
import { type DoctorCheck } from '@/doctor/types/doctor-check.type';
import { CliError } from '@/output/cli-error';
import { type CliWarning } from '@/output/types/cli-warning.type';

export const getProjectDoctorChecks = async ({
  explicitPath,
  workingDirectory,
  signal,
}: {
  explicitPath: string | undefined;
  workingDirectory: string;
  signal: AbortSignal;
}): Promise<DoctorCheck[]> => {
  let project: AppProject;

  signal.throwIfAborted();

  try {
    project = await resolveAppProject({ explicitPath, workingDirectory });
  } catch (error) {
    signal.throwIfAborted();

    const isOptional =
      !isDefined(explicitPath) &&
      error instanceof CliError &&
      (error.code === 'APP_NOT_FOUND' || error.code === 'APP_PATH_REQUIRED');

    return [
      {
        id: 'project',
        status: isOptional ? 'skipped' : 'fail',
        message:
          error instanceof CliError
            ? error.message
            : 'Could not inspect the app directory.',
        hint: 'Use --path <app directory> to check a specific app.',
      },
      { id: 'sdk', status: 'skipped', message: 'No app was selected.' },
    ];
  }

  const projectCheck: DoctorCheck = {
    id: 'project',
    status: 'pass',
    message: `${project.name} at ${project.path}.`,
    details: { name: project.name, path: project.path },
  };

  try {
    signal.throwIfAborted();

    const warnings: CliWarning[] = [];
    const sdk = await resolveSourceSdk({
      appPath: project.path,
      warn: (warning) => warnings.push(warning),
    });
    const [nodeWarning] = warnings;
    const details = { version: sdk.version, path: sdk.packagePath };

    return [
      projectCheck,
      isDefined(nodeWarning)
        ? {
            id: 'sdk',
            status: 'warning',
            code: nodeWarning.code,
            message: nodeWarning.message,
            hint: 'Builds continue. If one fails, switch to a Node version in that range.',
            details,
          }
        : {
            id: 'sdk',
            status: 'pass',
            message: `twenty-sdk ${sdk.version} provides the authoring exports required by the CLI.`,
            details,
          },
    ];
  } catch (error) {
    signal.throwIfAborted();

    return [
      projectCheck,
      {
        id: 'sdk',
        status: 'fail',
        code: error instanceof CliError ? error.code : 'INTERNAL_ERROR',
        message:
          error instanceof CliError
            ? error.message
            : 'Could not inspect the app SDK installation.',
        hint:
          error instanceof CliError
            ? error.hint
            : 'Check that the app dependencies are installed and readable.',
      },
    ];
  }
};
