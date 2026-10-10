import { isDefined } from 'twenty-shared/utils';

import { prepareAppAddFiles } from '@/app/add/prepare-app-add-files';
import { writeAppAddFiles } from '@/app/add/write-app-add-files';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { readAppIdentity } from '@/app/read-app-identity';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { CliError } from '@/output/cli-error';
import { commandText, formatSuccessLine } from '@/output/style';

export const runAppAddCommand: CommandRun = async (context) => {
  const { options, signal, output } = context;
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
      code: 'IDENTITY_READ_FAILED',
      message: 'No application definition found in this app.',
      hint: 'Start with twenty app init, or add a defineApplication definition.',
    });
  }

  for (const diagnostic of identity.diagnostics) {
    output.progress(formatToolingDiagnostic(diagnostic));
  }

  const { entity, name, files } = await prepareAppAddFiles({
    context,
    applicationUniversalIdentifier: identity.application.universalIdentifier,
  });
  const cleanupPaths = await writeAppAddFiles({
    appPath: project.path,
    files,
    signal,
  });

  for (const cleanupPath of cleanupPaths) {
    output.warn({
      code: 'APP_ADD_CLEANUP_FAILED',
      message: `Created definitions, but could not remove temporary directory ${cleanupPath}.`,
    });
  }

  return {
    data: {
      app: project,
      entity,
      name,
      createdPaths: files.map((file) => file.path),
      diagnostics: identity.diagnostics,
    },
    human: [
      ...files.map((file) => formatSuccessLine(`Created ${file.path}`)),
      ...(entity === 'object' && files.length === 1
        ? [
            'Add views, navigation and record-page layouts separately to expose the object in the UI.',
          ]
        : []),
      '',
      `Review with ${commandText('twenty app plan')}, then run ${commandText('twenty app apply')}.`,
    ].join('\n'),
  };
};
