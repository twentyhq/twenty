import { isDefined } from 'twenty-shared/utils';

import { createAppNotInstalledError } from '@/app/create-app-not-installed-error';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { generateAppClient } from '@/app/generate-app-client';
import { getClientGenerationSkipReason } from '@/app/get-client-generation-skip-reason';
import { getClientSdkPackagePath } from '@/app/get-client-sdk-package-path';
import { isApplicationNotFoundError } from '@/app/is-application-not-found-error';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { readAppIdentity } from '@/app/read-app-identity';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatDisplayPath } from '@/output/format-display-path';
import { colorText, formatSuccessLine } from '@/output/style';

export const runAppGenerateClientCommand: CommandRun<
  TargetCommandContext
> = async (context) => {
  const { options, output, outputMode, signal, target } = context;
  const startedAt = performance.now();
  const workingDirectory = process.cwd();
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory,
  });
  const skipReason = await getClientGenerationSkipReason({
    appPath: project.path,
  });

  if (isDefined(skipReason)) {
    throw new CliError({
      code: 'CLIENT_SDK_NOT_INSTALLED',
      message: `The typed API client cannot be generated: ${skipReason}`,
      hint: 'Install twenty-client-sdk in the app, for example with yarn add twenty-client-sdk, then try again.',
      details: { appPath: project.path },
    });
  }

  const identity = await readAppIdentity({ appPath: project.path, signal });

  if (!isDefined(identity.application)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: 'This project has no application definition.',
    });
  }

  const universalIdentifier =
    identity.application.universalIdentifier.toLowerCase();

  if (outputMode === 'human') {
    for (const diagnostic of identity.diagnostics) {
      output.progress({ message: formatToolingDiagnostic(diagnostic) });
    }
  }

  const sdk = await resolveSourceSdk({ appPath: project.path });
  const generationDiagnostics = await generateAppClient({
    appPath: project.path,
    applicationUniversalIdentifier: universalIdentifier,
    sdk,
    context,
  }).catch((error: unknown) => {
    if (
      isApplicationNotFoundError({
        error,
        field: 'applicationCoreGraphqlSchema',
      })
    ) {
      throw createAppNotInstalledError({
        universalIdentifier,
        apiUrl: target.apiUrl,
        hint: 'Install it with twenty app apply, which also generates the client.',
      });
    }

    throw error;
  });
  const clientPath = getClientSdkPackagePath({ appPath: project.path });
  const clientDisplayPath = formatDisplayPath({
    workingDirectory,
    targetPath: clientPath,
  });

  return {
    data: {
      app: { path: project.path, name: project.name },
      sdk: { version: sdk.version },
      client: { path: clientPath },
      application: identity.application,
      diagnostics: [...identity.diagnostics, ...generationDiagnostics],
      durationMilliseconds: Math.round(performance.now() - startedAt),
    },
    human: [
      formatSuccessLine(
        `Generated the typed API client for ${identity.application.displayName ?? project.name} from ${target.apiUrl}`,
      ),
      `  Saved in ${colorText('cyan', clientDisplayPath)}`,
    ].join('\n'),
  };
};
