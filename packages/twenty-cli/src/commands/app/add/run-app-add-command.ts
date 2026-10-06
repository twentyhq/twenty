import { isDefined } from 'twenty-shared/utils';

import { prepareAppAddFile } from '@/app/add/prepare-app-add-file';
import { writeAppAddFile } from '@/app/add/write-app-add-file';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { readAppIdentity } from '@/app/read-app-identity';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { CliError } from '@/output/cli-error';
import { formatSuccessLine } from '@/output/style';

export const runAppAddCommand: CommandRun = async (context) => {
  const { options, signal, output } = context;
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });
  const identity = await readAppIdentity({ appPath: project.path, signal });

  if (!isDefined(identity.application)) {
    throw new CliError({
      code: 'IDENTITY_READ_FAILED',
      message: 'No application definition found in this app.',
      hint: 'Start with twenty app init, or add a defineApplication definition.',
    });
  }

  for (const diagnostic of identity.diagnostics) {
    output.progress(formatToolingDiagnostic(diagnostic));
  }

  const file = await prepareAppAddFile(context);
  const cleanupPath = await writeAppAddFile({
    appPath: project.path,
    file,
    signal,
  });

  if (isDefined(cleanupPath)) {
    output.warn({
      code: 'APP_ADD_CLEANUP_FAILED',
      message: `Created ${file.path}, but could not remove temporary directory ${cleanupPath}.`,
    });
  }

  return {
    data: {
      app: project,
      entity: file.entity,
      name: file.name,
      createdPaths: [file.path],
      diagnostics: identity.diagnostics,
    },
    human: [
      formatSuccessLine(`Created ${file.path}`),
      ...(file.entity === 'object'
        ? [
            'Add views, navigation and record-page layouts separately to expose the object in the UI.',
          ]
        : []),
      '',
      'Review the definition, then run twenty app build.',
    ].join('\n'),
  };
};
